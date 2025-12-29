use ahash::RandomState;
use crossterm::{
    event::{self, Event, KeyCode, KeyEventKind, KeyModifiers},
    execute,
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use hashbrown::HashMap;
use rand::Rng;
use ratatui::{
    buffer::Buffer,
    layout::{Alignment, Constraint, Direction, Layout, Rect},
    style::{Color, Style},
    text::{Line, Span},
    widgets::{Block, Borders, Clear, Paragraph, Widget},
    Terminal,
};
use std::{io, time::Instant};

const DECK_LEN: usize = 20;

// 7-unique completion bonus
const SEVEN_BONUS: f64 = 15.0;

const FULL_DECK: [u8; DECK_LEN] = [
    1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, // 0..12
    1, 1, 1, 1, 1, // 13..17
    1, // 18
    3, // 19
];

const MOD_VALUES: [u8; DECK_LEN] = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0..12
    2, 4, 6, 8, 10, // 13..17
    0,  // 18
    0,  // 19
];

const SHIFT_HAND: u32 = 80;
const SHIFT_MOD: u32 = 93;
const SHIFT_FLAGS: u32 = 99;

const FLAG_SECOND_CHANCE: u8 = 1 << 0;
const FLAG_MULTIPLIER: u8 = 1 << 1;

#[inline]
fn final_score(num_score: u16, mod_score: u8, has_multiplier: bool) -> f64 {
    if has_multiplier {
        (num_score as f64) * 2.0 + (mod_score as f64)
    } else {
        (num_score as f64) + (mod_score as f64)
    }
}

#[inline]
fn pack_counts(counts: &[u8; DECK_LEN]) -> u128 {
    let mut packed: u128 = 0;
    for (i, &c) in counts.iter().enumerate() {
        debug_assert!(c <= 15);
        packed |= (c as u128) << (4 * i);
    }
    packed
}

#[inline]
fn get_count(packed_counts: u128, idx: usize) -> u8 {
    ((packed_counts >> (4 * idx)) & 0xF) as u8
}

#[inline]
fn dec_count(packed_counts: u128, idx: usize) -> u128 {
    packed_counts - (1u128 << (4 * idx))
}

#[inline]
fn sum_counts(packed_counts: u128) -> u16 {
    let mut total: u16 = 0;
    for i in 0..DECK_LEN {
        total += get_count(packed_counts, i) as u16;
    }
    total
}

#[inline]
fn pack_key(packed_counts: u128, hand_mask: u16, mod_score: u8, flags: u8) -> u128 {
    packed_counts
        | ((hand_mask as u128) << SHIFT_HAND)
        | ((mod_score as u128) << SHIFT_MOD)
        | ((flags as u128) << SHIFT_FLAGS)
}

fn build_mask_sum() -> [u16; 1 << 13] {
    let mut arr = [0u16; 1 << 13];
    for mask in 0..(1 << 13) {
        let mut s: u16 = 0;
        for bit in 0..13 {
            if (mask >> bit) & 1 == 1 {
                s += bit as u16;
            }
        }
        arr[mask] = s;
    }
    arr
}

// ---- Core solver: includes SEVEN_BONUS on completion ----
fn expected_value(
    packed_counts: u128,
    hand_mask: u16,
    mod_score: u8,
    flags: u8,
    memo: &mut HashMap<u128, f64, RandomState>,
    mask_sum: &[u16; 1 << 13],
) -> f64 {
    let key = pack_key(packed_counts, hand_mask, mod_score, flags);
    if let Some(&v) = memo.get(&key) {
        return v;
    }

    let total = sum_counts(packed_counts);
    let num_score = mask_sum[hand_mask as usize];
    let hand_size = hand_mask.count_ones() as u8;
    let has_second_chance = (flags & FLAG_SECOND_CHANCE) != 0;
    let has_multiplier = (flags & FLAG_MULTIPLIER) != 0;

    let stop_value = final_score(num_score, mod_score, has_multiplier);
    if total == 0 {
        memo.insert(key, stop_value);
        return stop_value;
    }

    let total_f = total as f64;
    let mut take_value: f64 = 0.0;

    for card_id in 0..DECK_LEN {
        let count = get_count(packed_counts, card_id);
        if count == 0 {
            continue;
        }

        let prob = (count as f64) / total_f;
        let new_counts = dec_count(packed_counts, card_id);

        if (13..=17).contains(&card_id) {
            let new_mod = mod_score + MOD_VALUES[card_id];
            take_value +=
                prob * expected_value(new_counts, hand_mask, new_mod, flags, memo, mask_sum);
            continue;
        }

        if card_id == 18 {
            let new_flags = flags | FLAG_MULTIPLIER;
            take_value +=
                prob * expected_value(new_counts, hand_mask, mod_score, new_flags, memo, mask_sum);
            continue;
        }

        if card_id == 19 {
            let new_flags = flags | FLAG_SECOND_CHANCE;
            take_value +=
                prob * expected_value(new_counts, hand_mask, mod_score, new_flags, memo, mask_sum);
            continue;
        }

        // number cards 0..12
        let bit = 1u16 << card_id;
        if (hand_mask & bit) != 0 {
            if has_second_chance {
                let new_flags = flags & !FLAG_SECOND_CHANCE;
                take_value += prob
                    * expected_value(new_counts, hand_mask, mod_score, new_flags, memo, mask_sum);
            }
            continue;
        }

        let new_hand_mask = hand_mask | bit;

        if hand_size == 6 {
            // Completing 7 uniques: add bonus
            let new_num_score = num_score + (card_id as u16);
            take_value +=
                prob * (final_score(new_num_score, mod_score, has_multiplier) + SEVEN_BONUS);
        } else {
            take_value +=
                prob * expected_value(new_counts, new_hand_mask, mod_score, flags, memo, mask_sum);
        }
    }

    let value = stop_value.max(take_value);
    memo.insert(key, value);
    value
}

fn expected_components(
    packed_counts: u128,
    hand_mask: u16,
    mod_score: u8,
    flags: u8,
    memo: &mut HashMap<u128, f64, RandomState>,
    mask_sum: &[u16; 1 << 13],
) -> (f64, f64) {
    let total = sum_counts(packed_counts);
    let num_score = mask_sum[hand_mask as usize];
    let hand_size = hand_mask.count_ones() as u8;
    let has_second_chance = (flags & FLAG_SECOND_CHANCE) != 0;
    let has_multiplier = (flags & FLAG_MULTIPLIER) != 0;

    let stop_value = final_score(num_score, mod_score, has_multiplier);
    if total == 0 {
        return (stop_value, 0.0);
    }

    let total_f = total as f64;
    let mut take_ev: f64 = 0.0;

    for card_id in 0..DECK_LEN {
        let count = get_count(packed_counts, card_id);
        if count == 0 {
            continue;
        }

        let prob = (count as f64) / total_f;
        let new_counts = dec_count(packed_counts, card_id);

        if (13..=17).contains(&card_id) {
            let new_mod = mod_score + MOD_VALUES[card_id];
            take_ev += prob * expected_value(new_counts, hand_mask, new_mod, flags, memo, mask_sum);
            continue;
        }

        if card_id == 18 {
            let new_flags = flags | FLAG_MULTIPLIER;
            take_ev +=
                prob * expected_value(new_counts, hand_mask, mod_score, new_flags, memo, mask_sum);
            continue;
        }

        if card_id == 19 {
            let new_flags = flags | FLAG_SECOND_CHANCE;
            take_ev +=
                prob * expected_value(new_counts, hand_mask, mod_score, new_flags, memo, mask_sum);
            continue;
        }

        let bit = 1u16 << card_id;
        if (hand_mask & bit) != 0 {
            if has_second_chance {
                let new_flags = flags & !FLAG_SECOND_CHANCE;
                take_ev += prob
                    * expected_value(new_counts, hand_mask, mod_score, new_flags, memo, mask_sum);
            }
            continue;
        }

        let new_hand_mask = hand_mask | bit;
        if hand_size == 6 {
            // Completing 7 uniques: add bonus
            let new_num_score = num_score + (card_id as u16);
            take_ev += prob * (final_score(new_num_score, mod_score, has_multiplier) + SEVEN_BONUS);
        } else {
            take_ev +=
                prob * expected_value(new_counts, new_hand_mask, mod_score, flags, memo, mask_sum);
        }
    }

    (stop_value, take_ev)
}

// ---- Game mechanics ----

#[derive(Clone, Copy, Debug)]
enum RoundOutcome {
    Continue,
    Finished(u32),
    Bust,
}

#[derive(Clone, Debug)]
struct GameState {
    packed_counts: u128,
    hand_mask: u16,
    mod_score: u8,
    flags: u8,

    // DISPLAY-ONLY: track which modifier cards were drawn (13..17) so we can show +2/+4/... cards.
    // bit 0 => +2 (id 13), bit 1 => +4 (14), ..., bit 4 => +10 (17)
    mod_mask: u8,
}

impl GameState {
    fn new_round() -> Self {
        Self {
            packed_counts: pack_counts(&FULL_DECK),
            hand_mask: 0,
            mod_score: 0,
            flags: 0,
            mod_mask: 0,
        }
    }

    fn has_second_chance(&self) -> bool {
        (self.flags & FLAG_SECOND_CHANCE) != 0
    }
    fn has_multiplier(&self) -> bool {
        (self.flags & FLAG_MULTIPLIER) != 0
    }
}

fn sample_card_id<R: Rng>(rng: &mut R, packed_counts: u128) -> Option<usize> {
    let total = sum_counts(packed_counts);
    if total == 0 {
        return None;
    }
    let mut r = rng.gen_range(0..total) as u16;
    for i in 0..DECK_LEN {
        let c = get_count(packed_counts, i) as u16;
        if c == 0 {
            continue;
        }
        if r < c {
            return Some(i);
        }
        r -= c;
    }
    None
}

fn apply_draw(gs: &mut GameState, card_id: usize, mask_sum: &[u16; 1 << 13]) -> RoundOutcome {
    gs.packed_counts = dec_count(gs.packed_counts, card_id);

    if (13..=17).contains(&card_id) {
        gs.mod_score = gs.mod_score.saturating_add(MOD_VALUES[card_id]);
        gs.mod_mask |= 1u8 << (card_id - 13); // display-only
        return RoundOutcome::Continue;
    }

    if card_id == 18 {
        gs.flags |= FLAG_MULTIPLIER;
        return RoundOutcome::Continue;
    }

    if card_id == 19 {
        gs.flags |= FLAG_SECOND_CHANCE;
        return RoundOutcome::Continue;
    }

    let bit = 1u16 << card_id;
    if (gs.hand_mask & bit) != 0 {
        if gs.has_second_chance() {
            gs.flags &= !FLAG_SECOND_CHANCE;
            return RoundOutcome::Continue;
        } else {
            return RoundOutcome::Bust;
        }
    }

    gs.hand_mask |= bit;
    let hand_size = gs.hand_mask.count_ones() as u8;
    if hand_size == 7 {
        // UI/game scoring: add bonus
        let num_score = mask_sum[gs.hand_mask as usize];
        let points = final_score(num_score, gs.mod_score, gs.has_multiplier()) + SEVEN_BONUS;
        return RoundOutcome::Finished(points.round() as u32);
    }

    RoundOutcome::Continue
}

fn current_points(gs: &GameState, mask_sum: &[u16; 1 << 13]) -> f64 {
    let num_score = mask_sum[gs.hand_mask as usize];
    final_score(num_score, gs.mod_score, gs.has_multiplier())
}

// ---- Widgets: number cards + token cards ----

#[derive(Clone, Copy)]
struct CardWidget {
    label: [char; 5],
    deactivated: bool,
}

impl CardWidget {
    fn from_rank(rank: u8, deactivated: bool) -> Self {
        let s = format!("{}", rank);
        Self::from_text(&s, deactivated)
    }

    fn from_text(text: &str, deactivated: bool) -> Self {
        let mut label = [' '; 5];
        for (i, ch) in text.chars().take(5).enumerate() {
            label[i] = ch;
        }
        Self { label, deactivated }
    }

    fn lines(&self) -> [String; 5] {
        let label_str: String = self.label.iter().collect();
        [
            "╭─────╮".to_owned(),
            format!("│{:<5}│", label_str),
            "│     │".to_owned(),
            format!("│{:>5}│", label_str),
            "╰─────╯".to_owned(),
        ]
    }
}

impl Widget for CardWidget {
    fn render(self, area: Rect, buf: &mut Buffer) {
        let clear_area = Rect::new(area.x, area.y, area.width.min(7), area.height.min(5));
        Clear.render(clear_area, buf);

        let lines = self.lines();
        for (y, line) in lines.iter().enumerate() {
            if y as u16 >= area.height || y as u16 >= 5 {
                break;
            }
            let text = line.chars().take(area.width as usize).collect::<String>();
            let span = if self.deactivated {
                Span::styled(text, Style::default().fg(Color::DarkGray))
            } else {
                Span::raw(text)
            };
            Line::from(span).render(Rect::new(area.x, area.y + y as u16, area.width, 1), buf);
        }
    }
}

#[derive(Clone, Copy)]
struct HandWidget {
    hand_mask: u16,
    mod_mask: u8,
    flags: u8,
}

impl HandWidget {
    fn token_labels(&self) -> Vec<&'static str> {
        let mut out: Vec<&'static str> = Vec::new();
        const MOD_LABELS: [&str; 5] = ["+2", "+4", "+6", "+8", "+10"];
        for i in 0..5 {
            if (self.mod_mask & (1u8 << i)) != 0 {
                out.push(MOD_LABELS[i]);
            }
        }
        if (self.flags & FLAG_MULTIPLIER) != 0 {
            out.push("x2");
        }
        if (self.flags & FLAG_SECOND_CHANCE) != 0 {
            out.push("SC");
        }
        out
    }
}

impl Widget for HandWidget {
    fn render(self, area: Rect, buf: &mut Buffer) {
        let mut ranks: Vec<u8> = Vec::new();
        for r in 0..13 {
            if (self.hand_mask & (1u16 << r)) != 0 {
                ranks.push(r as u8);
            }
        }

        let tokens = self.token_labels();

        let card_w: u16 = 7;
        let card_h: u16 = 5;
        let spacing: u16 = 3;

        let n_total = ranks.len() + tokens.len();
        if n_total == 0 {
            Paragraph::new("No cards yet")
                .alignment(Alignment::Center)
                .style(Style::default().fg(Color::DarkGray))
                .render(area, buf);
            return;
        }

        let total_w = card_w + (n_total as u16 - 1) * spacing + 2;

        let start_x = if area.width > total_w {
            area.x + (area.width - total_w) / 2
        } else {
            area.x
        };
        let start_y = if area.height > card_h {
            area.y + (area.height - card_h) / 2
        } else {
            area.y
        };

        let mut x = start_x;

        for &rank in &ranks {
            if x >= area.x + area.width {
                break;
            }
            CardWidget::from_rank(rank, false).render(Rect::new(x, start_y, card_w, card_h), buf);
            x = x.saturating_add(spacing);
        }

        for &label in &tokens {
            if x >= area.x + area.width {
                break;
            }
            CardWidget::from_text(label, false).render(Rect::new(x, start_y, card_w, card_h), buf);
            x = x.saturating_add(spacing);
        }
    }
}

fn suggested_action(stop: f64, take_ev: f64) -> &'static str {
    if take_ev > stop {
        "HIT"
    } else {
        "STAY"
    }
}

fn previous_card_text(last_drawn: Option<usize>) -> String {
    match last_drawn {
        None => "No previous card".to_owned(),
        Some(id) => {
            if id <= 12 {
                format!("Previous card: number {id}")
            } else if (13..=17).contains(&id) {
                format!("Previous card: modifier +{}", MOD_VALUES[id])
            } else if id == 18 {
                "Previous card: x2 multiplier".to_owned()
            } else {
                "Previous card: SC".to_owned()
            }
        }
    }
}

fn main() -> Result<(), io::Error> {
    let mask_sum = build_mask_sum();

    eprintln!("Precomputing full cache (will take ~10–30s)…");
    let t0 = Instant::now();
    let mut memo: HashMap<u128, f64, RandomState> = HashMap::with_hasher(RandomState::new());
    memo.reserve(22_000_000);

    let full_counts = pack_counts(&FULL_DECK);
    let _ = expected_value(full_counts, 0, 0, 0, &mut memo, &mask_sum);

    eprintln!(
        "Precompute done in {:.2}s. Cached states: {}",
        t0.elapsed().as_secs_f64(),
        memo.len()
    );

    enable_raw_mode()?;
    let mut stdout = io::stdout();
    execute!(stdout, EnterAlternateScreen)?;
    let backend = ratatui::backend::CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend)?;

    let mut rng = rand::thread_rng();
    let mut total_score: u32 = 0;
    let mut gs = GameState::new_round();
    let mut last_drawn: Option<usize> = None;

    let res = (|| -> Result<(), io::Error> {
        loop {
            let (stop_v, take_ev) = expected_components(
                gs.packed_counts,
                gs.hand_mask,
                gs.mod_score,
                gs.flags,
                &mut memo,
                &mask_sum,
            );
            let rec = suggested_action(stop_v, take_ev);

            terminal.draw(|f| {
                let size = f.area();

                let outer = Block::default()
                    .borders(Borders::ALL)
                    .title(" Flip-7 ")
                    .title_alignment(Alignment::Center);
                f.render_widget(outer, size);
                let inner = Rect::new(size.x + 1, size.y + 1, size.width - 2, size.height - 2);

                let chunks = Layout::default()
                    .direction(Direction::Vertical)
                    .constraints([
                        Constraint::Length(2),
                        Constraint::Length(2),
                        Constraint::Min(6),
                        Constraint::Length(1),
                    ])
                    .split(inner);

                let left_line = Line::from(vec![
                    Span::raw("Total: "),
                    Span::styled(
                        format!("{total_score}"),
                        Style::default().fg(Color::LightGreen),
                    ),
                ]);

                let total_remaining = sum_counts(gs.packed_counts);

                // UI: show that DrawEV includes +15 when 7th unique is possible
                let right_line = Line::from(vec![
                    Span::raw("Stop "),
                    Span::styled(
                        format!("{stop_v:.3}"),
                        Style::default().fg(Color::LightYellow),
                    ),
                    Span::raw(" | DrawEV "),
                    Span::styled(
                        format!("{take_ev:.3}"),
                        Style::default().fg(Color::LightBlue),
                    ),
                    Span::raw(" | 7-bonus "),
                    Span::styled(
                        format!("+{}", SEVEN_BONUS as u32),
                        Style::default().fg(Color::DarkGray),
                    ),
                    Span::raw(" | Suggest "),
                    Span::styled(
                        rec,
                        Style::default().fg(if rec == "HIT" {
                            Color::LightBlue
                        } else {
                            Color::LightYellow
                        }),
                    ),
                    Span::raw(" | Left "),
                    Span::raw(format!("{total_remaining}")),
                ]);

                let left_w = left_line.width() as u16;
                let right_w = right_line.width() as u16;

                let header_cols = Layout::default()
                    .direction(Direction::Horizontal)
                    .constraints([Constraint::Min(left_w), Constraint::Min(right_w)])
                    .split(chunks[0]);

                Paragraph::new(left_line)
                    .alignment(Alignment::Center)
                    .render(header_cols[0], f.buffer_mut());

                Paragraph::new(right_line)
                    .alignment(Alignment::Center)
                    .render(header_cols[1], f.buffer_mut());

                Paragraph::new(previous_card_text(last_drawn))
                    .alignment(Alignment::Center)
                    .render(chunks[1], f.buffer_mut());

                f.render_widget(
                    HandWidget {
                        hand_mask: gs.hand_mask,
                        mod_mask: gs.mod_mask,
                        flags: gs.flags,
                    },
                    chunks[2],
                );

                let left_cmd = Line::from(Span::raw("(h) Hit    (s) Stay"));
                let right_cmd = Line::from(Span::raw("(r) Reset    (q/CTRL-C) Quit"));

                let left_cmd_w = left_cmd.width() as u16;
                let right_cmd_w = right_cmd.width() as u16;

                let footer_cols = Layout::default()
                    .direction(Direction::Horizontal)
                    .constraints([Constraint::Min(left_cmd_w), Constraint::Min(right_cmd_w)])
                    .split(chunks[3]);

                Paragraph::new(left_cmd)
                    .alignment(Alignment::Center)
                    .style(Style::default().fg(Color::DarkGray))
                    .render(footer_cols[0], f.buffer_mut());

                Paragraph::new(right_cmd)
                    .alignment(Alignment::Center)
                    .style(Style::default().fg(Color::DarkGray))
                    .render(footer_cols[1], f.buffer_mut());
            })?;

            if event::poll(std::time::Duration::from_millis(50))? {
                let ev = event::read()?;
                if let Event::Key(k) = ev {
                    if k.kind != KeyEventKind::Press {
                        continue;
                    }

                    if k.code == KeyCode::Char('c') && k.modifiers.contains(KeyModifiers::CONTROL) {
                        break;
                    }

                    match k.code {
                        KeyCode::Char('q') => break,

                        KeyCode::Char('r') => {
                            total_score = 0;
                        }

                        KeyCode::Char('s') => {
                            let pts = current_points(&gs, &mask_sum).round() as u32;
                            total_score += pts;
                            gs = GameState::new_round();
                            last_drawn = None;
                        }

                        KeyCode::Char('h') => {
                            let Some(card_id) = sample_card_id(&mut rng, gs.packed_counts) else {
                                gs = GameState::new_round();
                                last_drawn = None;
                                continue;
                            };
                            last_drawn = Some(card_id);

                            match apply_draw(&mut gs, card_id, &mask_sum) {
                                RoundOutcome::Continue => {}
                                RoundOutcome::Bust => {
                                    gs = GameState::new_round();
                                    last_drawn = None;
                                }
                                RoundOutcome::Finished(pts) => {
                                    // pts already includes +15
                                    total_score += pts;
                                    gs = GameState::new_round();
                                    last_drawn = None;
                                }
                            }
                        }

                        _ => {}
                    }
                }
            }
        }
        Ok(())
    })();

    disable_raw_mode()?;
    execute!(terminal.backend_mut(), LeaveAlternateScreen)?;
    terminal.show_cursor()?;

    res
}
