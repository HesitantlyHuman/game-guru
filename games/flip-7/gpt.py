from __future__ import annotations

from functools import lru_cache
from typing import Tuple

FULL_DECK = [1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 1, 1, 1, 1, 1, 3]
DECK_LEN = len(FULL_DECK)

# Card identities
# 0-12 = numbers 0-12 (distinct; contribute their id to number score)
# 13..17 = modifiers +2,+4,+6,+8,+10
# 18 = x2 multiplier
# 19 = Second Chance

MOD_VALUES = (0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 6, 8, 10, 0, 0)


def final_score(num_score: int, mod_score: int, has_multiplier: bool) -> float:
    return (num_score * 2 + mod_score) if has_multiplier else (num_score + mod_score)


def dec_count(counts: Tuple[int, ...], idx: int) -> Tuple[int, ...]:
    # create a new tuple with counts[idx] decremented by 1
    lst = list(counts)
    lst[idx] -= 1
    return tuple(lst)


# Precompute sum of card ids for all 13-bit masks (0..8191)
MASK_SUM = [0] * (1 << 13)
for mask in range(1 << 13):
    s = 0
    m = mask
    while m:
        lsb = m & -m
        bit = lsb.bit_length() - 1  # 0..12
        s += bit
        m ^= lsb
    MASK_SUM[mask] = s


@lru_cache(maxsize=None)
def expected_value(
    counts: Tuple[int, ...],
    hand_mask: int,  # bits 0..12 indicate which number cards are already in hand
    mod_score: int,
    has_second_chance: bool,
    has_multiplier: bool,
) -> float:
    total = sum(counts)
    num_score = MASK_SUM[hand_mask]
    hand_size = hand_mask.bit_count()

    # option: stop now
    stop_value = final_score(num_score, mod_score, has_multiplier)

    if total == 0:
        return stop_value

    take_value = 0.0
    for card_id, count in enumerate(counts):
        if count == 0:
            continue

        prob = count / total
        new_counts = dec_count(counts, card_id)

        # modifier cards 13..17
        if 13 <= card_id <= 17:
            take_value += prob * expected_value(
                new_counts,
                hand_mask,
                mod_score + MOD_VALUES[card_id],
                has_second_chance,
                has_multiplier,
            )
            continue

        # multiplier
        if card_id == 18:
            take_value += prob * expected_value(
                new_counts,
                hand_mask,
                mod_score,
                has_second_chance,
                True,
            )
            continue

        # second chance
        if card_id == 19:
            take_value += prob * expected_value(
                new_counts,
                hand_mask,
                mod_score,
                True,
                has_multiplier,
            )
            continue

        # number cards 0..12
        bit = 1 << card_id
        if hand_mask & bit:
            # duplicate draw
            if has_second_chance:
                # burn the second chance and continue
                take_value += prob * expected_value(
                    new_counts,
                    hand_mask,
                    mod_score,
                    False,
                    has_multiplier,
                )
            # else: bust -> contributes 0
            continue

        # new distinct number card
        new_hand_mask = hand_mask | bit

        # if this draw completes the 7-card hand, score immediately
        # (original code finished when len(hand) == 6 before adding; equivalently, after add -> size == 7)
        if hand_size == 6:
            new_num_score = num_score + card_id
            take_value += prob * final_score(new_num_score, mod_score, has_multiplier)
        else:
            take_value += prob * expected_value(
                new_counts,
                new_hand_mask,
                mod_score,
                has_second_chance,
                has_multiplier,
            )

    return max(stop_value, take_value)


if __name__ == "__main__":
    start_counts = tuple(FULL_DECK)
    ev = expected_value(start_counts, 0, 0, False, False)
    print(ev)
