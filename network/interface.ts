import { Message, Commitment, Revelation, MessageType } from "./protocol";

interface BattleshipCommunicator {}

interface Cell {
  row: number;
  col: number;
}

interface Shot {
  cell: Cell;
  result: ShotResult;
}

interface Board {
  width: number;
  height: number;
  results: [ShotResult];
}

enum ShotResult {
  hit,
  miss,
  invalid,
}

const Board = {
  commit_to_board(board: Board) {
    const commitments = Board.to_commitments(board);
  },
  to_commitments(
    board: Board
  ): Promise<[{ [key: string]: Commitment }, { [key: string]: Revelation }]> {
    return new Promise<
      [{ [key: string]: Commitment }, { [key: string]: Revelation }]
    >(async (resolve, reject) => {
      const commitments: { [key: string]: Commitment } = {};
      const revelations: { [key: string]: Revelation } = {};
      for (var i = 0; i < board.width; i++) {
        for (var j = 0; j < board.height; j++) {
          const cell = { row: i, col: j };
          const shot_index = i * board.width + j;
          const shot_result = board.results[shot_index];
          const commitment_id = [i, j].toString();
          const [commitment, revelation] = await Commitment.new(
            commitment_id,
            shot_result.toString()
          );
          commitments[commitment.id] = commitment;
          revelations[revelation.id] = revelation;
        }
      }
      resolve([commitments, revelations]);
    });
  },
};

function make_commitments(
  connection,
  commitments: { [key: string]: Commitment }
) {}

function send_shot(connection, shot): Promise<ShotResult> {
  return new Promise<ShotResult>((resolve, reject) => {
    resolve(ShotResult.hit);
  });
}

function get_shot(connection): Promise<Cell> {
  return new Promise<Cell>((resolve, reject) => {
    resolve({ row: 0, col: 0 });
  });
}

function reveal_commitments(connection, keys: [string]) {}
