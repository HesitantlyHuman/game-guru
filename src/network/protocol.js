"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = exports.Revelation = exports.Commitment = void 0;
var text_encoder = new TextEncoder();
var text_decoder = new TextDecoder();
var SECRET_LENGTH = 16;
var HASH_LENGTH = 64;
var MessageType;
(function (MessageType) {
    MessageType[MessageType["clear"] = 0] = "clear";
    MessageType[MessageType["commitment"] = 1] = "commitment";
    MessageType[MessageType["revelation"] = 2] = "revelation";
})(MessageType || (MessageType = {}));
exports.Commitment = {
    new: function (id, data) {
        return new Promise(function (resolve, reject) {
            var secret = crypto.getRandomValues(new Uint8Array(SECRET_LENGTH));
            var data_bytes = text_encoder.encode(data);
            var hash_content = new Uint8Array(secret.length + data_bytes.length);
            hash_content.set(secret);
            hash_content.set(data_bytes, secret.length);
            crypto.subtle
                .digest("SHA-512", hash_content)
                .then(function (hash) {
                var commitment = {
                    id: id,
                    hash: hash,
                };
                var revelation = {
                    id: id,
                    secret: secret,
                    message: data,
                };
                return resolve([commitment, revelation]);
            })
                .catch(function (error) {
                return reject(error);
            });
        });
    },
    encode: function (commitment) {
        var id_array = text_encoder.encode(commitment.id);
        var hash_array = new Uint8Array(commitment.hash);
        var commitment_array = new Uint8Array(id_array.length + hash_array.length);
        commitment_array.set(hash_array);
        commitment_array.set(id_array, hash_array.length);
        return commitment_array.buffer;
    },
    decode: function (commitment_buffer) {
        var hash_bytes = commitment_buffer.slice(0, HASH_LENGTH);
        var id_bytes = commitment_buffer.slice(HASH_LENGTH);
        var id = text_decoder.decode(id_bytes);
        return {
            id: id,
            hash: hash_bytes,
        };
    },
    is_instance: function (object) {
        return "id" in object && "hash" in object;
    }
};
exports.Revelation = {
    encode: function (revelation) {
        var id_array = text_encoder.encode(revelation.id);
        var secret_array = new Uint8Array(revelation.secret);
        var message_array = text_encoder.encode(revelation.message);
        var revelation_array = new Uint8Array(id_array.length + SECRET_LENGTH + message_array.length + 1);
        revelation_array.set([id_array.length]);
        revelation_array.set(id_array, 1);
        revelation_array.set(secret_array, id_array.length + 1);
        revelation_array.set(message_array, id_array.length + SECRET_LENGTH + 1);
        return revelation_array.buffer;
    },
    decode: function (revelation_buffer) {
        var id_length = new Uint8Array(revelation_buffer.slice(0, 1))[0];
        var id_bytes = revelation_buffer.slice(1, id_length + 1);
        var secret_bytes = revelation_buffer.slice(id_length + 1, id_length + 1 + SECRET_LENGTH);
        var message_bytes = revelation_buffer.slice(id_length + 1 + SECRET_LENGTH);
        var id = text_decoder.decode(id_bytes);
        var message = text_decoder.decode(message_bytes);
        return {
            id: id,
            secret: secret_bytes,
            message: message,
        };
    },
    verify: function (revelation, commitment) {
        return new Promise(function (resolve, reject) {
            var data_bytes = text_encoder.encode(revelation.message);
            var hash_content = new Uint8Array(SECRET_LENGTH + data_bytes.length);
            hash_content.set(new Uint8Array(revelation.secret));
            hash_content.set(data_bytes, SECRET_LENGTH);
            crypto.subtle
                .digest("SHA-512", hash_content)
                .then(function (hash) {
                var commitment_hash = new Uint8Array(commitment.hash);
                var hash_bytes = new Uint8Array(hash);
                var same = true;
                for (var i = 0; i < commitment_hash.length; i++) {
                    if (commitment_hash[i] != hash_bytes[i]) {
                        same = false;
                    }
                }
                resolve(same);
            })
                .catch(function (error) {
                reject(error);
            });
        });
    },
    is_instance: function (object) {
        return "id" in object && "secret" in object && "message" in object;
    }
};
exports.Message = {
    encode: function (message) {
        if (typeof message === "string") {
            var text_bytes = text_encoder.encode(message).buffer;
            var message_bytes = new Uint8Array(1 + text_bytes.byteLength);
            message_bytes.set([MessageType.clear]);
            message_bytes.set(new Uint8Array(text_bytes), 1);
            return message_bytes.buffer;
        }
        else if (exports.Commitment.is_instance(message)) {
            var commitment_bytes = exports.Commitment.encode(message);
            var message_bytes = new Uint8Array(1 + commitment_bytes.byteLength);
            message_bytes.set([MessageType.commitment]);
            message_bytes.set(new Uint8Array(commitment_bytes), 1);
            return message_bytes.buffer;
        }
        else if (exports.Revelation.is_instance(message)) {
            var revelation_bytes = exports.Revelation.encode(message);
            var message_bytes = new Uint8Array(1 + revelation_bytes.byteLength);
            message_bytes.set([MessageType.revelation]);
            message_bytes.set(new Uint8Array(revelation_bytes), 1);
            return message_bytes.buffer;
        }
        else {
            throw new Error("TypeError: Invalid message type, cannot encode");
        }
    },
    decode: function (message_buffer) {
        var message_type = new Uint8Array(message_buffer.slice(0, 1))[0];
        var message_bytes = message_buffer.slice(1);
        if (message_type == MessageType.clear) {
            return text_decoder.decode(message_bytes);
        }
        else if (message_type == MessageType.commitment) {
            return exports.Commitment.decode(message_bytes);
        }
        else if (message_type == MessageType.revelation) {
            return exports.Revelation.decode(message_bytes);
        }
        else {
            throw new Error("TypeError: Invalid message type: " + message_type + ", cannot decode");
        }
    },
};
//# sourceMappingURL=protocol.js.map