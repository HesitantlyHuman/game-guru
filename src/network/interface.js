"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var protocol_1 = require("./protocol");
var network_1 = require("./network");
var ShotResult;
(function (ShotResult) {
    ShotResult[ShotResult["hit"] = 0] = "hit";
    ShotResult[ShotResult["miss"] = 1] = "miss";
    ShotResult[ShotResult["invalid"] = 2] = "invalid";
    ShotResult[ShotResult["inconsistent"] = 3] = "inconsistent";
})(ShotResult || (ShotResult = {}));
var BattleshipCommunicator = /** @class */ (function () {
    function BattleshipCommunicator() {
        this.is_offerer = false;
        this.is_connected = false;
        this.connection = new RTCPeerConnection(network_1.RTC_CONFIG);
    }
    // Connection methods
    BattleshipCommunicator.prototype.create_offer = function () {
        var _this = this;
        this.is_offerer = true;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.data_channel_promise = (0, network_1.establish_data_channel)(this.connection);
                        _a = resolve;
                        return [4 /*yield*/, (0, network_1.create_offer)(this.connection)];
                    case 1:
                        _a.apply(void 0, [_b.sent()]);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    ;
    BattleshipCommunicator.prototype.create_answer = function (offer) {
        var _this = this;
        if (this.is_offerer) {
            throw new Error("Cannot create answer as offerer");
        }
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.data_channel_promise = (0, network_1.establish_data_channel)(this.connection, false);
                        _a = resolve;
                        return [4 /*yield*/, (0, network_1.create_answer)(this.connection, offer)];
                    case 1:
                        _a.apply(void 0, [_b.sent()]);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    ;
    BattleshipCommunicator.prototype.accept_answer = function (answer) {
        var _this = this;
        if (!this.is_offerer) {
            throw new Error("Cannot accept answer if you have not made an offer");
        }
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, network_1.accept_answer)(this.connection, answer)];
                    case 1:
                        _a.sent();
                        resolve();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    ;
    BattleshipCommunicator.prototype.finalize_connection = function () {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.data_channel_promise];
                    case 1:
                        _a.data_channel = _b.sent();
                        this.is_connected = true;
                        resolve();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    ;
    // Game methods
    BattleshipCommunicator.prototype.commit_to_board = function (board) {
        var _this = this;
        if (!this.is_connected) {
            throw new Error("Cannot commit to board until connected");
        }
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var _a, commitments, revelations, commitment_id;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Board.to_commitments(board)];
                    case 1:
                        _a = _b.sent(), commitments = _a[0], revelations = _a[1];
                        this.revelations = revelations;
                        for (commitment_id in commitments) {
                            this.data_channel.send(protocol_1.Message.encode(commitments[commitment_id]));
                        }
                        this.data_channel.send(protocol_1.Message.encode("END-BOARD"));
                        resolve();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    BattleshipCommunicator.prototype.await_opponent_board = function () {
        var _this = this;
        if (!this.is_connected) {
            throw new Error("Cannot await opponent board until connected");
        }
        return new Promise(function (resolve, reject) {
            _this.data_channel.onmessage = function (event) {
                var message = protocol_1.Message.decode(event.data);
                if (typeof message === "string") {
                    if (message == "END-BOARD") {
                        resolve();
                    }
                }
                else if (protocol_1.Commitment.is_instance(message)) {
                    _this.commitments[message.id] = message;
                }
            };
        });
    };
    BattleshipCommunicator.prototype.shoot_cell = function (cell) {
        var _this = this;
        if (!this.is_connected) {
            throw new Error("Cannot shoot cell until connected");
        }
        var message = [cell.row, cell.col].toString();
        this.data_channel.send(protocol_1.Message.encode(message));
        function handle_message(event, commitments) {
            return __awaiter(this, void 0, void 0, function () {
                var message;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            message = protocol_1.Message.decode(event.data);
                            if (typeof message === "string") {
                                if (parseInt(message) == ShotResult.invalid) {
                                    return [2 /*return*/, ShotResult.invalid];
                                }
                                else {
                                    return [2 /*return*/, ShotResult.inconsistent];
                                }
                            }
                            if (!protocol_1.Revelation.is_instance(message)) return [3 /*break*/, 2];
                            if (!(message.id in commitments)) {
                                return [2 /*return*/, ShotResult.inconsistent];
                            }
                            return [4 /*yield*/, protocol_1.Revelation.verify(message, commitments[message.id])];
                        case 1:
                            if (_a.sent()) {
                                return [2 /*return*/, parseInt(message.message)];
                            }
                            else {
                                return [2 /*return*/, ShotResult.inconsistent];
                            }
                            _a.label = 2;
                        case 2: throw new Error("no ShotResult received");
                    }
                });
            });
        }
        return new Promise(function (resolve, reject) {
            _this.data_channel.onmessage = function (event) {
                try {
                    handle_message(event, _this.commitments).then(function (shot_result) {
                        resolve(shot_result);
                    });
                }
                catch (_) { }
            };
        });
    };
    BattleshipCommunicator.prototype.receive_shot = function () {
        var _this = this;
        if (!this.is_connected) {
            throw new Error("Cannot receive shot until connected");
        }
        function handle_message(event, revelations) {
            return __awaiter(this, void 0, void 0, function () {
                var message, _a, row, col, cell;
                return __generator(this, function (_b) {
                    message = protocol_1.Message.decode(event.data);
                    if (typeof message === "string") {
                        _a = message.split(","), row = _a[0], col = _a[1];
                        cell = { row: parseInt(row), col: parseInt(col) };
                        if (!(message in revelations)) {
                            return [2 /*return*/, [cell, String(ShotResult.invalid)]];
                        }
                        return [2 /*return*/, [cell, revelations[message]]];
                    }
                    throw new Error("no id received");
                });
            });
        }
        return new Promise(function (resolve, reject) {
            _this.data_channel.onmessage = function (event) {
                try {
                    handle_message(event, _this.revelations).then(function (_a) {
                        var received = _a[0], response = _a[1];
                        _this.data_channel.send(protocol_1.Message.encode(response));
                        resolve(received);
                    });
                }
                catch (_) { }
            };
        });
    };
    return BattleshipCommunicator;
}());
var Board = {
    to_commitments: function (board) {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var commitments, revelations, i, j, shot_index, shot_result, commitment_id, _a, commitment, revelation;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        commitments = {};
                        revelations = {};
                        i = 0;
                        _b.label = 1;
                    case 1:
                        if (!(i < board.width)) return [3 /*break*/, 6];
                        j = 0;
                        _b.label = 2;
                    case 2:
                        if (!(j < board.height)) return [3 /*break*/, 5];
                        shot_index = i * board.width + j;
                        shot_result = board.results[shot_index];
                        commitment_id = [i, j].toString();
                        return [4 /*yield*/, protocol_1.Commitment.new(commitment_id, shot_result.toString())];
                    case 3:
                        _a = _b.sent(), commitment = _a[0], revelation = _a[1];
                        commitments[commitment.id] = commitment;
                        revelations[revelation.id] = revelation;
                        _b.label = 4;
                    case 4:
                        j++;
                        return [3 /*break*/, 2];
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6:
                        resolve([commitments, revelations]);
                        return [2 /*return*/];
                }
            });
        }); });
    },
};
var communicator = new BattleshipCommunicator();
var other_communicator = new BattleshipCommunicator();
communicator.create_offer().then(function (offer) {
    other_communicator.create_answer(offer).then(function (answer) {
        communicator.accept_answer(answer).then(function () {
            communicator.finalize_connection().then(function () {
                console.log("connected");
            });
        });
    });
});
//# sourceMappingURL=interface.js.map