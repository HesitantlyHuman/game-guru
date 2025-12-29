use ahash::RandomState;
use hashbrown::HashMap;

const DECK_LEN: usize = 20;

// FULL_DECK as counts per card_id (0..19)
const FULL_DECK: [u8; DECK_LEN] = [
    1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, // 0..12 number cards
    1, 1, 1, 1, 1, // 13..17 modifiers (+2,+4,+6,+8,+10)
    1, // 18 multiplier
    3, // 19 second chance
];

const MOD_VALUES: [u8; DECK_LEN] = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0..12
    2, 4, 6, 8, 10, // 13..17
    0,  // 18
    0,  // 19
];

// Bit positions / packing layout in the u128 key:
//
// bits 0..79   : counts (20 nibbles, 4 bits each; card i at bits [4i..4i+3])
// bits 80..92  : hand_mask (13 bits)
// bits 93..98  : mod_score (6 bits; enough for <= 63; here max 30)
// bits 99..100 : flags (2 bits): bit0=second chance, bit1=multiplier
//
// Everything fits within 128 bits comfortably.

const SHIFT_COUNTS: u32 = 0;
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
    // Decrement nibble at idx by 1 (caller ensures count>0)
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
    debug_assert!(hand_mask < (1 << 13));
    debug_assert!(mod_score < 64);
    debug_assert!(flags < 4);

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

    // Option to stop now
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

        // modifiers 13..17
        if (13..=17).contains(&card_id) {
            let new_mod = mod_score + MOD_VALUES[card_id];
            take_value +=
                prob * expected_value(new_counts, hand_mask, new_mod, flags, memo, mask_sum);
            continue;
        }

        // multiplier 18
        if card_id == 18 {
            let new_flags = flags | FLAG_MULTIPLIER;
            take_value +=
                prob * expected_value(new_counts, hand_mask, mod_score, new_flags, memo, mask_sum);
            continue;
        }

        // second chance 19
        if card_id == 19 {
            let new_flags = flags | FLAG_SECOND_CHANCE;
            take_value +=
                prob * expected_value(new_counts, hand_mask, mod_score, new_flags, memo, mask_sum);
            continue;
        }

        // number cards 0..12
        debug_assert!(card_id <= 12);
        let bit = 1u16 << card_id;

        if (hand_mask & bit) != 0 {
            // duplicate draw
            if has_second_chance {
                // burn second chance, continue
                let new_flags = flags & !FLAG_SECOND_CHANCE;
                take_value += prob
                    * expected_value(new_counts, hand_mask, mod_score, new_flags, memo, mask_sum);
            }
            // else bust -> contributes 0
            continue;
        }

        // new distinct number card
        let new_hand_mask = hand_mask | bit;

        // original logic: if len(hand)==6 before adding, then after adding you score immediately (7 cards)
        if hand_size == 6 {
            let new_num_score = num_score + (card_id as u16);
            take_value += prob * final_score(new_num_score, mod_score, has_multiplier);
        } else {
            take_value +=
                prob * expected_value(new_counts, new_hand_mask, mod_score, flags, memo, mask_sum);
        }
    }

    let value = stop_value.max(take_value);
    memo.insert(key, value);
    value
}

fn main() {
    let mask_sum = build_mask_sum();
    let packed_counts = pack_counts(&FULL_DECK);

    // Using hashbrown + ahash: faster than std HashMap and typically less overhead.
    // You can tune reserve() if you have a feel for state count.
    let mut memo: HashMap<u128, f64, RandomState> = HashMap::with_hasher(RandomState::new());
    memo.reserve(22_000_000);

    let hand_mask: u16 = 0;
    let mod_score: u8 = 0;
    let flags: u8 = 0;

    let ev = expected_value(
        packed_counts,
        hand_mask,
        mod_score,
        flags,
        &mut memo,
        &mask_sum,
    );
    println!("{ev}");
    eprintln!("states cached: {}", memo.len());
}
