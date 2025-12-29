from typing import Tuple, List, Dict

from collections import Counter
from itertools import product, chain

NUM_DICE = 6
MAX_PIPS = 6

total_counts = [MAX_PIPS ** (num_dice + 1) for num_dice in range(NUM_DICE)]
roll_counts: List[Dict[Tuple[int], int]] = [{} for _ in range(NUM_DICE)]
point_lookup: Dict[Tuple[int], int] = {}

# TODO move to own repo!


def normalize_roll(roll: Tuple[int]) -> Tuple[Tuple[int], int]:
    roll = tuple([dice for dice in roll if dice is not None])
    starting_length = len(roll)
    sorted_roll = tuple(sorted(roll))
    if sorted_roll == (0, 1, 2, 3, 4, 5):
        return (sorted_roll, 1500)
    counts = Counter(sorted_roll)
    if starting_length == 6 and all([count in [2, 4] for count in counts.values()]):
        return (sorted_roll, 1500)
    if starting_length == 6 and all([count == 3 for count in counts.values()]):
        return (sorted_roll, 2500)
    cleared_roll = []
    points = 0
    for roll, number in counts.items():
        if number == 6:
            return (sorted_roll, 3000)
        elif number == 5:
            cleared_roll.extend([roll] * number)
            points += 2000
        elif number == 4:
            cleared_roll.extend([roll] * number)
            points += 1000
        elif number == 3:
            cleared_roll.extend([roll] * number)
            if roll == 0:
                points += 300
            else:
                points += (roll + 1) * 100
        elif roll == 0:
            cleared_roll.extend([roll] * number)
            points += 100 * number
        elif roll == 4:
            cleared_roll.extend([roll] * number)
            points += 50 * number
    cleared_roll.extend([None] * (starting_length - len(cleared_roll)))
    return (tuple(cleared_roll), points)


for num_dice in range(NUM_DICE):
    for roll in product(*[range(MAX_PIPS) for _ in range(num_dice + 1)]):
        normalized_roll, points = normalize_roll(roll)
        if not normalized_roll in point_lookup:
            point_lookup[normalized_roll] = points
        if not normalized_roll in roll_counts[num_dice]:
            roll_counts[num_dice][normalized_roll] = 0
        roll_counts[num_dice][normalized_roll] += 1

single_roll_point_expectations = []

for num_dice in range(NUM_DICE):
    total_count = total_counts[num_dice]
    total_expectation = 0.0
    for roll, num_counts in roll_counts[num_dice].items():
        probability = num_counts / total_count
        points = point_lookup[roll]
        total_expectation += probability * points
    single_roll_point_expectations.append(total_expectation)

precalculated = {}

# Precalculated
minimum_points_to_keep_per_num_dice = [300, 250, 400, 950, 2800, 16800]


def _calculate_expected_points(
    current_points: int,
    available_dice: int,
    search_depth: int = 100,
    lookup_cache: dict = None,
) -> float:
    if current_points > minimum_points_to_keep_per_num_dice[available_dice - 1]:
        return current_points

    if (current_points, available_dice) in precalculated:
        return precalculated[(current_points, available_dice)]

    if lookup_cache is not None and (current_points, available_dice) in lookup_cache:
        return lookup_cache[(current_points, available_dice)]

    # Suppose we choose to roll
    rolls = roll_counts[available_dice - 1]
    total_outcomes = total_counts[available_dice - 1]
    expected_return = 0
    for roll, num_occurances in rolls.items():
        points_from_roll = point_lookup[roll]
        if points_from_roll == 0:
            continue

        num_available_dice = roll.count(None)
        if num_available_dice == 0:
            num_available_dice = NUM_DICE

        if search_depth == 0:
            expected_points = (
                current_points
                + points_from_roll
                + single_roll_point_expectations[num_available_dice - 1]
            )
        else:
            expected_points = _calculate_expected_points(
                current_points=current_points + points_from_roll,
                available_dice=num_available_dice,
                search_depth=search_depth - 1,
                lookup_cache=lookup_cache,
            )
        probability = num_occurances / total_outcomes
        expected_return += probability * expected_points

    # Return the best of rolling vs not rolling
    result = max(expected_return, current_points)
    if lookup_cache is not None:
        lookup_cache[(current_points, available_dice)] = result
    return result


def calculate_expected_points(
    current_points: int,
    available_dice: int,
    search_depth: int = 100,
) -> float:
    if (current_points, available_dice) in precalculated:
        return precalculated[(current_points, available_dice)]

    lookup_cache = {}
    calculated_expectation = _calculate_expected_points(
        current_points=current_points,
        available_dice=available_dice,
        search_depth=search_depth,
        lookup_cache=lookup_cache,
    )
    precalculated[(current_points, available_dice)] = calculated_expectation
    return calculated_expectation


def strategy_options(current_roll: Tuple[int]):
    current_roll = tuple([dice for dice in current_roll if dice is not None])
    strategy_choices = {}

    starting_length = len(current_roll)
    sorted_roll = tuple(sorted(current_roll))
    counts = Counter(sorted_roll)

    if sorted_roll == (0, 1, 2, 3, 4, 5) or (
        starting_length == 6 and all([count in [2, 4] for count in counts.values()])
    ):
        strategy_choices[sorted_roll] = 1500
    if starting_length == 6 and all([count == 3 for count in counts.values()]):
        strategy_choices[sorted_roll] = 2500

    strategy_options_by_roll = []
    for roll, number in counts.items():
        if roll in [0, 4]:
            strategy_options_by_roll.append(
                [[roll] * number_kept for number_kept in range(1, number + 1)] + [None]
            )
        elif number >= 3:
            strategy_options_by_roll.append(
                [[roll] * number_kept for number_kept in range(3, number + 1)] + [None]
            )
    for option in product(*strategy_options_by_roll):
        option = list(
            chain(*[component for component in option if component is not None])
        )
        if len(option) == 0:
            continue
        option = tuple(option + [None] * (NUM_DICE - len(option)))
        points = point_lookup[option]
        if option not in strategy_choices or strategy_choices[option] < points:
            strategy_choices[option] = points

    # Now, we want to only keep the highest scoring kept dice for each number of
    # available dice
    best_strategy = [(None, 0)] * NUM_DICE
    for dice_to_keep, points_from_kept in strategy_choices.items():
        num_available_dice = dice_to_keep.count(None)
        prev_best_points = best_strategy[num_available_dice - 1][1]
        if points_from_kept > prev_best_points:
            best_strategy[num_available_dice - 1] = (dice_to_keep, points_from_kept)

    strategy_choices = [
        (strategy, points) for strategy, points in best_strategy if strategy is not None
    ]

    return strategy_choices


def _calculate_expected_points_improved(
    banked_points: int,
    current_roll: Tuple[int],
    search_depth: int = 100,
    lookup_cache: dict = None,
) -> float:
    if lookup_cache is not None and (banked_points, current_roll) in lookup_cache:
        return lookup_cache[(banked_points, current_roll)]

    def _calculate_expectation(
        strategy: Tuple[int],
        banked_points: int,
        kept_points: int,
        search_depth: int,
        lookup_cache: dict = None,
    ) -> float:
        num_available_dice = dice_to_keep.count(None)
        if num_available_dice == 0:
            num_available_dice = NUM_DICE
            strategy = ()

        possible_rolls_from_available = roll_counts[num_available_dice - 1]
        total_number_of_outcomes_with_available = total_counts[num_available_dice - 1]
        expectation_using_strategy = 0.0

        for (
            hypothetical_roll,
            number_of_occurances,
        ) in possible_rolls_from_available.items():
            points_from_roll = point_lookup[hypothetical_roll]
            hypothetical_state = (
                tuple([dice for dice in strategy if dice is not None])
                + hypothetical_roll
            )
            hypothetical_state, _ = normalize_roll(hypothetical_state)

            # Farkles will not contribute any amount to the expectation
            if points_from_roll == 0:
                continue
            num_available_dice_after_roll = hypothetical_roll.count(None)
            if num_available_dice_after_roll == 0:
                num_available_dice_after_roll = NUM_DICE

            if search_depth == 0:
                expected_points = (
                    banked_points
                    + kept_points
                    + points_from_roll
                    + single_roll_point_expectations[num_available_dice - 1]
                )
            else:
                expected_points, _ = _calculate_expected_points_improved(
                    banked_points=banked_points,
                    current_roll=hypothetical_state,
                    search_depth=search_depth - 1,
                    lookup_cache=lookup_cache,
                )
            probability = number_of_occurances / total_number_of_outcomes_with_available
            expectation_using_strategy += probability * expected_points

        return expectation_using_strategy

    # Suppose we choose to roll
    current_points = banked_points + point_lookup[current_roll]
    best_expectation, best_dice_to_keep = 0, None

    for dice_to_keep, points_from_kept in strategy_options(current_roll):
        expectation = _calculate_expectation(
            strategy=dice_to_keep,
            banked_points=banked_points,
            kept_points=points_from_kept,
            search_depth=search_depth,
            lookup_cache=lookup_cache,
        )
        if expectation > best_expectation:
            best_expectation = expectation
            best_dice_to_keep = dice_to_keep

    # Return the best of rolling vs not rolling
    current_roll_points = point_lookup[current_roll]
    points_if_stop = banked_points + current_roll_points
    if best_expectation > points_if_stop:
        result = (best_expectation, best_dice_to_keep)
    else:
        result = (points_if_stop, "STOP")

    if lookup_cache is not None:
        lookup_cache[(banked_points, current_roll)] = result
    return result


def calculate_expected_points_improved(
    banked_points: int,
    current_roll: Tuple[int],
    search_depth: int = 50,
) -> float:
    current_roll, _ = normalize_roll(current_roll)
    lookup_cache = {}
    return _calculate_expected_points_improved(
        banked_points=banked_points,
        current_roll=current_roll,
        search_depth=search_depth,
        lookup_cache=lookup_cache,
    )


# TODO: fix the fact that the improved one allows you to get combos, when you
# are supposed to be disqualified from that
print(calculate_expected_points_improved(0, (0, 2, 2, 3, 5, 0)))
print(calculate_expected_points(100, 5))
