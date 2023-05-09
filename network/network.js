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
var ShotResult;
(function (ShotResult) {
    ShotResult[ShotResult["hit"] = 0] = "hit";
    ShotResult[ShotResult["miss"] = 1] = "miss";
    ShotResult[ShotResult["invalid"] = 2] = "invalid";
})(ShotResult || (ShotResult = {}));
var rtc_config = {
    iceServers: [
        {
            urls: "stun:a.relay.metered.ca:80",
        },
        {
            urls: "turn:a.relay.metered.ca:80?transport=tcp",
            username: "5d4cf69b45c147cabda11087",
            credential: "sQICQhWXEoS7ZzPD",
        },
        {
            urls: "turn:a.relay.metered.ca:443?transport=tcp",
            username: "5d4cf69b45c147cabda11087",
            credential: "sQICQhWXEoS7ZzPD",
        },
    ],
};
var DATA_CHANNEL_LABEL = "battleship";
function handle_datachannel_connection(event) {
    console.log("datachannel connected");
}
function handle_disconnect(event) {
    console.log("datachannel disconnected");
}
function handle_message(event) {
    console.log("received message:", event.data);
}
function establish_data_channel(connection, create_channel) {
    var _this = this;
    if (create_channel === void 0) { create_channel = true; }
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var channel_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    if (!create_channel) return [3 /*break*/, 1];
                    channel_1 = connection.createDataChannel(DATA_CHANNEL_LABEL);
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, new Promise(function (resolve, reject) {
                        connection.ondatachannel = function (event) {
                            resolve(event.channel);
                        };
                    })];
                case 2:
                    channel_1 = _a.sent();
                    _a.label = 3;
                case 3:
                    channel_1.onmessage = handle_message;
                    channel_1.onclose = handle_disconnect;
                    channel_1.onopen = function (event) {
                        handle_datachannel_connection(event);
                        resolve(channel_1);
                    };
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    reject(error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); });
}
function create_offer(prospective_connection) {
    var _this = this;
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var offer, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, prospective_connection.createOffer()];
                case 1:
                    offer = _a.sent();
                    return [4 /*yield*/, prospective_connection.setLocalDescription(offer)];
                case 2:
                    _a.sent();
                    prospective_connection.onicecandidate = function (event) {
                        if (event.candidate) {
                            resolve(JSON.stringify(prospective_connection.localDescription));
                        }
                    };
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    reject(error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
}
function create_answer(prospective_connection, offer) {
    var _this = this;
    var session_description = new RTCSessionDescription(JSON.parse(offer));
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var remote_connection_promise, answer, local_description_promise, answer_string, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    remote_connection_promise = prospective_connection.setRemoteDescription(session_description);
                    return [4 /*yield*/, prospective_connection.createAnswer()];
                case 1:
                    answer = _a.sent();
                    local_description_promise = prospective_connection.setLocalDescription(answer);
                    answer_string = JSON.stringify(answer);
                    return [4 /*yield*/, remote_connection_promise];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, local_description_promise];
                case 3:
                    _a.sent();
                    resolve(answer_string);
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _a.sent();
                    reject(error_3);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); });
}
function accept_answer(prospective_connection, answer) {
    prospective_connection.setRemoteDescription(new RTCSessionDescription(JSON.parse(answer)));
}
function make_commitments(connection, commitments) { }
function send_shot(connection, shot) {
    return new Promise(function (resolve, reject) {
        resolve(ShotResult.hit);
    });
}
function get_shot(connection) {
    return new Promise(function (resolve, reject) {
        resolve({ row: 0, col: 0 });
    });
}
function reveal_commitments(connection, keys) { }
var connection_one = new RTCPeerConnection(rtc_config);
var connection_two = new RTCPeerConnection(rtc_config);
var connection_one_channel_promise = establish_data_channel(connection_one);
var connection_two_channel_promise = establish_data_channel(connection_two, false);
create_offer(connection_one)
    .then(function (offer) {
    create_answer(connection_two, offer).then(function (answer) {
        accept_answer(connection_one, answer);
    });
})
    .then(function () {
    Promise.all([
        connection_one_channel_promise,
        connection_two_channel_promise,
    ]).then(function (channels) {
        var channel_one = channels[0];
        var channel_two = channels[1];
        channel_one.send("hello");
        channel_two.send("world");
    });
});
// Close the connections after 3 seconds
setTimeout(function () {
    connection_one.close();
    connection_two.close();
    console.log("all done");
}, 5000);
//# sourceMappingURL=network.js.map