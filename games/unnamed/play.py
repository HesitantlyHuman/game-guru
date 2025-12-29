import sys

BOARD_SIZE = 5
EMPTY = "."
WALL = "#"


class Player:
    def __init__(self, name, symbol):
        self.name = name
        self.symbol = symbol
        self.stones = []
        self.wall_remaining = 1
        self.stones_remaining = 3
        self.wall_pos = None
        self.prev_moved = set()

    def has_pieces_to_place(self):
        return self.stones_remaining > 0 or self.wall_remaining > 0


class Game:
    def __init__(self):
        self.board = [[EMPTY for _ in range(BOARD_SIZE)] for _ in range(BOARD_SIZE)]
        self.players = [Player("Player 1", "X"), Player("Player 2", "O")]
        self.turn = 0  # used to track turns in movement phase
        self.first_player_index = 0  # index of who placed first

    def print_board(self, highlight_players=None):
        print("\n  " + " ".join(str(i) for i in range(BOARD_SIZE)))
        for y in range(BOARD_SIZE):
            row_str = f"{y} "
            for x in range(BOARD_SIZE):
                cell = self.board[y][x]
                color = ""
                end = "\033[0m"

                # Determine if this is a player's stone
                if highlight_players:
                    for player in highlight_players:
                        if cell == player.symbol:
                            is_movable = False
                            if (x, y) not in player.prev_moved:
                                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                                    nx, ny = x + dx, y + dy
                                    if self.valid_pos(nx, ny):
                                        target = self.board[ny][nx]
                                        if target != WALL and target != player.symbol:
                                            is_movable = True
                                            break
                            color = "\033[92m" if is_movable else "\033[91m"
                            break
                if cell == WALL:
                    color = "\033[90m"

                row_str += f"{color}{cell}{end} "
            print(row_str)
        print()

    def valid_pos(self, x, y):
        return 0 <= x < BOARD_SIZE and 0 <= y < BOARD_SIZE

    def is_empty(self, x, y):
        return self.board[y][x] == EMPTY

    def place_stone(self, player, x, y):
        if self.is_empty(x, y):
            self.board[y][x] = player.symbol
            player.stones.append((x, y))
            player.stones_remaining -= 1
            return True
        return False

    def place_wall(self, player, x, y):
        if self.is_empty(x, y):
            self.board[y][x] = WALL
            player.wall_remaining -= 1
            player.wall_pos = (x, y)
            return True
        return False

    def move_stone(self, player, from_x, from_y, to_x, to_y):
        if not self.valid_pos(to_x, to_y):
            return False, "Invalid target"

        if (from_x, from_y) not in player.stones:
            return False, "You don't own that stone"

        if (from_x, from_y) in player.prev_moved:
            return False, "Stone already moved last turn"

        if abs(to_x - from_x) + abs(to_y - from_y) != 1:
            return False, "Invalid move (only orthogonal moves allowed)"

        target = self.board[to_y][to_x]
        if target == WALL:
            return False, "Cannot move onto a wall"
        elif target == EMPTY:
            pass
        elif target == player.symbol:
            return False, "Cannot move onto your own stone"
        else:
            # Capture opponent stone
            for opp in self.players:
                if opp.symbol == target:
                    opp.stones.remove((to_x, to_y))
                    break

        self.board[from_y][from_x] = EMPTY
        self.board[to_y][to_x] = player.symbol
        player.stones.remove((from_x, from_y))
        player.stones.append((to_x, to_y))
        player.prev_moved.add((to_x, to_y))
        return True, "Moved"

    def input_coords(self, prompt):
        while True:
            try:
                coords = input(prompt).strip().split()
                if len(coords) != 2:
                    raise ValueError
                x, y = map(int, coords)
                if not self.valid_pos(x, y):
                    raise ValueError
                return x, y
            except ValueError:
                print(
                    "Invalid input. Please enter two integers in range separated by space."
                )

    def placement_phase(self):
        print("== PLACEMENT PHASE ==")
        turn = 0
        while any(p.has_pieces_to_place() for p in self.players):
            player = self.players[turn % 2]
            self.print_board()
            print(
                f"{player.name}'s turn to place. Stones left: {player.stones_remaining}, Wall left: {player.wall_remaining}"
            )
            while True:
                choice = input("Place (stone/wall): ").strip().lower()
                if choice == "stone" and player.stones_remaining > 0:
                    x, y = self.input_coords("Place stone at (x y): ")
                    if self.place_stone(player, x, y):
                        break
                    else:
                        print("That position is occupied.")
                elif choice == "wall" and player.wall_remaining > 0:
                    x, y = self.input_coords("Place wall at (x y): ")
                    if self.place_wall(player, x, y):
                        break
                    else:
                        print("That position is occupied.")
                else:
                    print("Invalid choice or no pieces of that type left.")
            turn += 1
        self.first_player_index = 0  # whoever placed first moves first
        print("Placement complete.\n")

    def movement_phase(self):
        print("== MOVEMENT PHASE ==")
        while True:
            player = self.players[(self.first_player_index + self.turn) % 2]
            opponent = self.players[(self.first_player_index + self.turn + 1) % 2]

            if not player.stones:
                self.print_board()
                print(f"{player.name} has no stones left. {opponent.name} wins!")
                break

            # Check if the player has any stones that can legally move
            def can_legally_move(x, y):
                if (x, y) in player.prev_moved:
                    return False  # cannot move this turn
                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    nx, ny = x + dx, y + dy
                    if self.valid_pos(nx, ny):
                        target = self.board[ny][nx]
                        if target != WALL and target != player.symbol:
                            return True
                return False

            if not any(can_legally_move(x, y) for x, y in player.stones):
                self.print_board(highlight_players=self.players)
                print(f"{player.name} cannot move any stones. {opponent.name} wins!")
                break

            self.print_board(highlight_players=self.players)
            print(f"{player.name}'s turn. Stones: {len(player.stones)}")

            moved_this_turn = set()
            while True:
                print("You must move at least one stone. Type 'done' when finished.")
                cmd = input("Move (from_x from_y to_x to_y): ")
                if cmd.strip() == "done":
                    if not moved_this_turn:
                        print("You must move at least one stone.")
                        continue
                    break
                try:
                    fx, fy, tx, ty = map(int, cmd.strip().split())
                    success, msg = self.move_stone(player, fx, fy, tx, ty)
                    if success:
                        moved_this_turn.add((tx, ty))
                        self.print_board(highlight_players=self.players)
                    else:
                        print("Error:", msg)
                except ValueError:
                    print("Invalid input. Format: from_x from_y to_x to_y")

            player.prev_moved = moved_this_turn
            self.turn += 1

    def play(self):
        self.placement_phase()
        self.movement_phase()


if __name__ == "__main__":
    game = Game()
    game.play()
