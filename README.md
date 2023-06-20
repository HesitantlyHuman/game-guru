
# TO RUN
"npm run dev" in the game-guru directory

# game-guru
p2p games with cool sovlers

# Notes
Game/Network Interface
----------------------

connect to another player
place our ships
shoot spot and receive response {Hit, Miss, Invalid}
await shot and send response {Hit, Miss, Invalid}

what happens if opponent shoots invalid spot, (bad index, already shot)
how do we verify syncronization?



STEPS to transfer B -> (G5) -> A:
- B -> Hash 3
- A: Sync_Candidate <- Sync_State XOR Hash 3
- A -> Sync_Candidate
- B: if Sync_Candidates match set Sync_State to Candidate
- B -> (G5)
- A -> Hit + Corresponding secret
- B: Verifies Commitment and Updates State

connect to another player - Just use WebRTC

function connect(connection_details): connection {
}

function commit_to_board(connection, dict) {
}

function send_shot(connection, shot): result {
}

function await_shot(connection): shot {
}

function reveal_cell(connection, key) {
}









NetworkUI
	Behavior


	
	Interface



Battleship
	Behavior
Everything
	
	Interface



Grid
	Behavior
Manage tile selection
Ensure only one tile selected
Draw tiles based on size and state
	
	Interface
rows (integer)
cols (integer)
bind:current_selected ([row, col])

GridTile
	Behavior
Show selection ring
Show current state
	
	Interface
is_selected (boolean)
current_state (string) // Change to one of a few predetermined styles
on_click()

GridShaper
	Behavior
Select row and col
Show ghost grid
Send size suggestion to opponent
Confirm matching sizes
	
	Interface
on_suggest(row, col)

FiringMenu
	Behavior
Show current selected
Display option buttons (fire, stand down)
Confirm action
	
	Interface
current _selected ([row, col])
on_action(action_string) // TODO make enum later…

ShipPlacementMenu
	Behavior
Select ships
Rotate ships
Remove Ship
Confirm Board

Interface
ships (id => ship_shape array)
is_placed (id => boolean)
on_selected_change(ship_id, rotation_integer)
on_remove_ship(ship_ids)
on_confirm_board()



TODO: Make offer for peer to peer stuff in URL


# Comments
	Every comment should have one purpose, (make multiple commments if multiple points need to be made)

	TODO's:
	- TODO statments must contain the exact string "TODO" in them (case sensitive)
	- TODO statments all need a description of what is needed, and the motivation (there must be enough context for someone else to impliment the change)

	READABILITY COMMENTS:
	- It is encouraged to add comments to describe non-obvious behavior (such as mathematical/algorithmic principles, unsatisfiable conditions, etc). These should describe the implicit behavior.
	- All code that violates convention needs to have an explanation for why it's violating convention
	- Avoid adding needless comments, refactor the code for readability instead if possible
	- If there are less than 10 items, avoid using comments just to categorize them
	
	DOCUMENTATION COMMENTS:
	- TODO look at docstrings