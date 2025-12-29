from typing import List, Set, Tuple

import numpy as np
import numpy.typing as npt

FULL_DECK = [1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 1, 1, 1, 1, 1, 3]
DECK_LEN = len(FULL_DECK)

# Card identities
# 0-12 = 0-12
# 13 = +2
# 14 = +4
# 15 = +6
# 16 = +8
# 17 = +10
# 18 = x2
# 19 = Second Chance

LOOKUP = {}


def update_score(current_score: Tuple[float, float], card_id: int) -> float:
    if card_id <= 12:
        return (current_score[0] + card_id, current_score[1])
    elif card_id == 13:
        return (current_score[0], current_score[1] + 2)
    elif card_id == 14:
        return (current_score[0], current_score[1] + 4)
    elif card_id == 15:
        return (current_score[0], current_score[1] + 6)
    elif card_id == 16:
        return (current_score[0], current_score[1] + 8)
    elif card_id == 17:
        return (current_score[0], current_score[1] + 10)
    raise ValueError(f"Cannot update score with id: {card_id}")


def get_final_score(current_score: Tuple[float, float], has_multiplier: bool) -> float:
    if has_multiplier:
        return current_score[0] * 2 + current_score[1]
    else:
        return current_score[0] + current_score[1]


def get_round_expected(
    deck_counts: npt.NDArray[np.int8],
    hand: Set[int],
    current_score: Tuple[float, float],  # Number cards, Modifiers
    has_second_chance: bool,
    has_multiplier: bool,
) -> float:
    lookup_key = (
        deck_counts.tobytes(),
        tuple(hand),
        has_second_chance,
        has_multiplier,
    )
    if lookup_key in LOOKUP:
        return LOOKUP[lookup_key]

    # Calculate expected if we take the next card
    probs = deck_counts / np.sum(deck_counts)
    expected_value_card = 0

    # Iterate over the options
    for card_id, prob, count in zip(range(DECK_LEN), probs, deck_counts):
        if count == 0:
            continue

        # If it's a scoring card, just add it
        if card_id >= 13 and card_id < 18:
            # Create a new deck with the card removed
            hypothetical_deck_counts = deck_counts.copy()
            hypothetical_deck_counts[card_id] -= 1
            expected_value_card += prob * get_round_expected(
                hypothetical_deck_counts,
                hand.copy(),
                update_score(current_score, card_id),
                has_second_chance,
                has_multiplier,
            )
            continue

        # Same with multiplier
        if card_id == 18:
            # Create a new deck with the card removed
            hypothetical_deck_counts = deck_counts.copy()
            hypothetical_deck_counts[card_id] -= 1
            expected_value_card += prob * get_round_expected(
                hypothetical_deck_counts,
                hand.copy(),
                current_score,
                has_second_chance,
                has_multiplier=True,
            )
            continue

        # And second chance
        if card_id == 19:
            # Create a new deck with the card removed
            hypothetical_deck_counts = deck_counts.copy()
            hypothetical_deck_counts[card_id] -= 1
            expected_value_card += prob * get_round_expected(
                hypothetical_deck_counts,
                hand.copy(),
                current_score,
                has_second_chance=True,
                has_multiplier=has_multiplier,
            )
            continue

        # Now, the number cards
        # Check if we already have this card in hand
        if card_id in hand:
            # If we don't have a second chance, we bust and add no value to the expected
            if has_second_chance:
                # Create a new deck with the card removed
                hypothetical_deck_counts = deck_counts.copy()
                hypothetical_deck_counts[card_id] -= 1
                expected_value_card += prob * get_round_expected(
                    hypothetical_deck_counts,
                    hand.copy(),
                    current_score,
                    False,
                    has_multiplier,
                )
        # If we don't already have this card in hand, just add it
        else:
            hypothetical_score = update_score(current_score, card_id)
            # First, check if we have finished the round
            if len(hand) == 6:
                # Just score then
                expected_value_card += prob * get_final_score(
                    hypothetical_score, has_multiplier
                )
            # If not, get the expected
            else:
                # Create a new deck with the card removed
                hypothetical_deck_counts = deck_counts.copy()
                hypothetical_deck_counts[card_id] -= 1
                hypothetical_hand = hand.copy()
                hypothetical_hand.add(card_id)
                expected_value_card += prob * get_round_expected(
                    hypothetical_deck_counts,
                    hypothetical_hand,
                    hypothetical_score,
                    has_second_chance,
                    has_multiplier,
                )

    # Now, return the best of the current score and the expected if we take a card
    value = max(get_final_score(current_score, has_multiplier), expected_value_card)
    LOOKUP[lookup_key] = value
    print(f"Returning value of {value}")
    print(hand)
    return max(get_final_score(current_score, has_multiplier), expected_value_card)


print(
    get_round_expected(np.array(FULL_DECK, dtype=np.int8), set(), (0, 0), False, False)
)
