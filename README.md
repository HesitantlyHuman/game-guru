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
