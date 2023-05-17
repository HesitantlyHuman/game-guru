import { BattleshipCommunicator, ShotResult } from "./network/interface";

let communicator = new BattleshipCommunicator();
let other_communicator = new BattleshipCommunicator();

let board = {
    width: 2,
    height: 2,
    results: [ShotResult.hit, ShotResult.miss, ShotResult.miss, ShotResult.miss]
}

communicator.create_offer().then((offer) => {
    other_communicator.create_answer(offer).then((answer) => {
        communicator.accept_answer(answer).then(() => {
            communicator.finalize_connection().then(() => {
                other_communicator.finalize_connection().then(() => {
                    console.log("connected");
                    other_communicator.await_opponent_board().then(() => {
                        console.log("got opponent board");
                        other_communicator.shoot_cell({ row: 0, col: 0 }).then((result) => {
                            console.log("shot cell");
                            console.log(result);
                        });
                    });
                    communicator.commit_to_board(board).then(() => {
                        console.log("committed");
                        communicator.receive_shot().then((cell) => {
                            console.log("received shot");
                            console.log(cell);
                        });
                    });
                });
            });
        });
    });
});

