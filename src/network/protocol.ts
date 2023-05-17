const text_encoder = new TextEncoder();
const text_decoder = new TextDecoder();
const SECRET_LENGTH = 16;
const HASH_LENGTH = 64;

enum MessageType {
  clear,
  commitment,
  revelation,
}

export type Commitment = {
  id: string;
  hash: ArrayBuffer;
}

export type Revelation = {
  id: string;
  secret: ArrayBuffer;
  message: string;
}

export type Message = Commitment | Revelation | string;

export const Commitment = {
  new(id: string, data: string): Promise<[Commitment, Revelation]> {
    return new Promise<[Commitment, Revelation]>((resolve, reject) => {
      const secret = crypto.getRandomValues(new Uint8Array(SECRET_LENGTH));
      const data_bytes = text_encoder.encode(data);
      const hash_content = new Uint8Array(secret.length + data_bytes.length);
      hash_content.set(secret);
      hash_content.set(data_bytes, secret.length);
      crypto.subtle
        .digest("SHA-512", hash_content)
        .then((hash) => {
          const commitment: Commitment = {
            id: id,
            hash: hash,
          };
          const revelation: Revelation = {
            id: id,
            secret: secret,
            message: data,
          };
          return resolve([commitment, revelation]);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  },
  encode(commitment: Commitment): ArrayBuffer {
    const id_array = text_encoder.encode(commitment.id);
    const hash_array = new Uint8Array(commitment.hash);
    const commitment_array = new Uint8Array(
      id_array.length + hash_array.length
    );
    commitment_array.set(hash_array);
    commitment_array.set(id_array, hash_array.length);
    return commitment_array.buffer;
  },
  decode(commitment_buffer: ArrayBuffer): Commitment {
    const hash_bytes = commitment_buffer.slice(0, HASH_LENGTH);
    const id_bytes = commitment_buffer.slice(HASH_LENGTH);
    const id = text_decoder.decode(id_bytes);
    return {
      id: id,
      hash: hash_bytes,
    };
  },
  is_instance(object: any): object is Commitment {
    return "id" in object && "hash" in object;
  }
};

export const Revelation = {
  encode(revelation: Revelation): ArrayBuffer {
    const id_array = text_encoder.encode(revelation.id);
    const secret_array = new Uint8Array(revelation.secret);
    const message_array = text_encoder.encode(revelation.message);
    const revelation_array = new Uint8Array(
      id_array.length + SECRET_LENGTH + message_array.length + 1
    );
    revelation_array.set([id_array.length]);
    revelation_array.set(id_array, 1);
    revelation_array.set(secret_array, id_array.length + 1);
    revelation_array.set(message_array, id_array.length + SECRET_LENGTH + 1);
    return revelation_array.buffer;
  },
  decode(revelation_buffer: ArrayBuffer): Revelation {
    const id_length = new Uint8Array(revelation_buffer.slice(0, 1))[0];
    const id_bytes = revelation_buffer.slice(1, id_length + 1);
    const secret_bytes = revelation_buffer.slice(
      id_length + 1,
      id_length + 1 + SECRET_LENGTH
    );
    const message_bytes = revelation_buffer.slice(
      id_length + 1 + SECRET_LENGTH
    );
    const id = text_decoder.decode(id_bytes);
    const message = text_decoder.decode(message_bytes);
    return {
      id: id,
      secret: secret_bytes,
      message: message,
    };
  },
  verify(revelation: Revelation, commitment: Commitment): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const data_bytes = text_encoder.encode(revelation.message);
      const hash_content = new Uint8Array(SECRET_LENGTH + data_bytes.length);
      hash_content.set(new Uint8Array(revelation.secret));
      hash_content.set(data_bytes, SECRET_LENGTH);
      crypto.subtle
        .digest("SHA-512", hash_content)
        .then((hash) => {
          const commitment_hash = new Uint8Array(commitment.hash);
          const hash_bytes = new Uint8Array(hash);
          let same = true;
          for (let i = 0; i < commitment_hash.length; i++) {
            if (commitment_hash[i] != hash_bytes[i]) {
              same = false;
            }
          }
          resolve(same);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  is_instance(object: any): object is Revelation {
    return "id" in object && "secret" in object && "message" in object;
  }
};

export const Message = {
  encode(message: Message): ArrayBuffer {
    if (typeof message === "string") {
      const text_bytes = text_encoder.encode(message).buffer;
      const message_bytes = new Uint8Array(1 + text_bytes.byteLength);
      message_bytes.set([MessageType.clear]);
      message_bytes.set(new Uint8Array(text_bytes), 1);
      return message_bytes.buffer;
    } else if (Commitment.is_instance(message)) {
      const commitment_bytes = Commitment.encode(message);
      const message_bytes = new Uint8Array(1 + commitment_bytes.byteLength);
      message_bytes.set([MessageType.commitment]);
      message_bytes.set(new Uint8Array(commitment_bytes), 1);
      return message_bytes.buffer;
    } else if (Revelation.is_instance(message)) {
      const revelation_bytes = Revelation.encode(message);
      const message_bytes = new Uint8Array(1 + revelation_bytes.byteLength);
      message_bytes.set([MessageType.revelation]);
      message_bytes.set(new Uint8Array(revelation_bytes), 1);
      return message_bytes.buffer;
    } else {
      throw new Error("TypeError: Invalid message type, cannot encode");
    }
  },
  decode(message_buffer: ArrayBuffer): Message {
    const message_type = new Uint8Array(message_buffer.slice(0, 1))[0];
    const message_bytes = message_buffer.slice(1);
    if (message_type == MessageType.clear) {
      return text_decoder.decode(message_bytes);
    } else if (message_type == MessageType.commitment) {
      return Commitment.decode(message_bytes);
    } else if (message_type == MessageType.revelation) {
      return Revelation.decode(message_bytes);
    } else {
      console.log(message_buffer);
      throw new Error(
        "TypeError: Invalid message type: " + message_type + ", cannot decode"
      );
    }
  },
};
