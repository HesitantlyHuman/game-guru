BattleshipCommunicator {
    create_offer(): Promise<string>;
    create_answer(offer: string): Promise<string>;
    accept_answer(answer: string): Promise<void>;
    finalize_connection(): Promise<void>;

    commit_to_board(board: Board): Promise<void>;
    await_opponent_board(): Promise<void>;
    shoot_cell(cell: Cell): Promise<ShotResult>;
    receive_shot(): Promise<Cell>;
}