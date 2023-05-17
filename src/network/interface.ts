import { Message, Commitment, Revelation } from "./protocol";
import { create_offer, create_answer, accept_answer, establish_data_channel, RTC_CONFIG } from "./network";

export type Cell = {
  row: number;
  col: number;
}

export enum ShotResult {
  hit,
  miss,
  invalid,
  inconsistent,
}

export type Board = {
  width: number;
  height: number;
  results: ShotResult[];
}

export class BattleshipCommunicator {
  connection: RTCPeerConnection;
  data_channel_promise: Promise<RTCDataChannel>;
  data_channel: RTCDataChannel;

  is_offerer: boolean;
  is_connected: boolean;

  commitments: { [key: string]: Commitment };
  revelations: { [key: string]: Revelation };

  constructor() {
    this.is_offerer = false;
    this.is_connected = false;

    this.connection = new RTCPeerConnection(RTC_CONFIG);

    this.commitments = {};
    this.revelations = {};
  }

  // Connection methods
  create_offer(): Promise<string> {
    this.is_offerer = true;
    return new Promise<string>(async (resolve, reject) => {
      this.data_channel_promise = establish_data_channel(this.connection);
      resolve(await create_offer(this.connection));
    });
  };
  create_answer(offer: string): Promise<string> {
    if (this.is_offerer) {
      throw new Error("Cannot create answer as offerer");
    }
    return new Promise<string>(async (resolve, reject) => {
      this.data_channel_promise = establish_data_channel(
        this.connection,
        false
      );
      resolve(await create_answer(this.connection, offer));
    });
  };
  accept_answer(answer: string): Promise<void> {
    if (!this.is_offerer) {
      throw new Error("Cannot accept answer if you have not made an offer");
    }
    return new Promise<void>(async (resolve, reject) => {
      await accept_answer(this.connection, answer);
      resolve();
    });
  };
  finalize_connection(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      this.data_channel = await this.data_channel_promise;
      this.is_connected = true;
      resolve();
    });
  };

  // Game methods
  commit_to_board(board: Board): Promise<void> {
    if (!this.is_connected) {
      throw new Error("Cannot commit to board until connected");
    }
    return new Promise<void>(async (resolve, reject) => {
      let [commitments, revelations] = await Board.to_commitments(board);
      this.revelations = revelations;
      for (var commitment_id in commitments) {
        this.data_channel.send(Message.encode(commitments[commitment_id]));
      }
      this.data_channel.send(Message.encode("END-BOARD"));
      resolve();
    });
  }
  await_opponent_board(): Promise<void> {
    if (!this.is_connected) {
      throw new Error("Cannot await opponent board until connected");
    }
    return new Promise<void>((resolve, reject) => {
      this.data_channel.onmessage = (event) => {
        const message = Message.decode(event.data);
        if (typeof message === "string") {
          if (message == "END-BOARD") {
            resolve();
          }
        } else if (Commitment.is_instance(message)) {
          this.commitments[message.id] = message;
        }
      }
    });
  }
  shoot_cell(cell: Cell): Promise<ShotResult> {
    if (!this.is_connected) {
      throw new Error("Cannot shoot cell until connected");
    }
    let message = [cell.row, cell.col].toString();
    this.data_channel.send(Message.encode(message));

    async function handle_message(
      event: MessageEvent,
      commitments: { [key: string]: Commitment })
      : Promise<ShotResult> {
      const message = Message.decode(event.data);
      if (typeof message === "string") {
        if (parseInt(message) == ShotResult.invalid) {
          return ShotResult.invalid;
        } else {
          return ShotResult.inconsistent;
        }
      }
      if (Revelation.is_instance(message)) {
        if (!(message.id in commitments)) {
          return ShotResult.inconsistent;
        }
        if (await Revelation.verify(message, commitments[message.id])) {
          return parseInt(message.message);
        } else {
          return ShotResult.inconsistent;
        }
      }
      throw new Error("no ShotResult received");
    }

    return new Promise<ShotResult>((resolve, reject) => {
      this.data_channel.onmessage = (event) => {
        try {
          handle_message(event, this.commitments).then((shot_result) => {
            resolve(shot_result);
          });
        } catch (_) { }
      }
    });
  }
  receive_shot(): Promise<Cell> {
    if (!this.is_connected) {
      throw new Error("Cannot receive shot until connected");
    }

    async function handle_message(
      event: MessageEvent,
      revelations: { [key: string]: Revelation })
      : Promise<[Cell, Message]> {
      const message = Message.decode(event.data);
      if (typeof message === "string") {
        let [row, col] = message.split(",");
        let cell = { row: parseInt(row), col: parseInt(col) };
        if (!(message in revelations)) {
          return [cell, String(ShotResult.invalid)];
        }
        return [cell, revelations[message]];
      }
      throw new Error("no id received");
    }


    return new Promise<Cell>((resolve, reject) => {
      this.data_channel.onmessage = (event) => {
        try {
          handle_message(event, this.revelations).then(([received, response]) => {
            this.data_channel.send(Message.encode(response));
            resolve(received);
          });
        } catch (_) { }
      }
    });
  }
}

export const Board = {
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