interface Connection {
  rtc: RTCPeerConnection;
  channel: RTCDataChannel;
}

const rtc_config: RTCConfiguration = {
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

const DATA_CHANNEL_LABEL = "battleship";

function establish_data_channel(
  connection: RTCPeerConnection,
  create_channel: boolean = true
): Promise<RTCDataChannel> {
  return new Promise<RTCDataChannel>(async (resolve, reject) => {
    try {
      let channel;
      if (create_channel) {
        channel = connection.createDataChannel(DATA_CHANNEL_LABEL);
      } else {
        channel = await new Promise<RTCDataChannel>((resolve, reject) => {
          connection.ondatachannel = (event) => {
            resolve(event.channel);
          };
        });
      }
      channel.onopen = (event) => {
        resolve(channel);
      };
    } catch (error) {
      reject(error);
    }
  });
}

function create_offer(
  prospective_connection: RTCPeerConnection
): Promise<string> {
  return new Promise<string>(async (resolve, reject) => {
    try {
      const offer = await prospective_connection.createOffer();
      await prospective_connection.setLocalDescription(offer);
      prospective_connection.onicecandidate = (event) => {
        if (event.candidate) {
          resolve(JSON.stringify(prospective_connection.localDescription));
        }
      };
    } catch (error) {
      reject(error);
    }
  });
}

function create_answer(
  prospective_connection: RTCPeerConnection,
  offer: string
): Promise<string> {
  const session_description = new RTCSessionDescription(JSON.parse(offer));
  return new Promise<string>(async (resolve, reject) => {
    try {
      let remote_connection_promise =
        prospective_connection.setRemoteDescription(session_description);
      const answer = await prospective_connection.createAnswer();
      let local_description_promise =
        prospective_connection.setLocalDescription(answer);
      const answer_string = JSON.stringify(answer);
      await remote_connection_promise;
      await local_description_promise;
      resolve(answer_string);
    } catch (error) {
      reject(error);
    }
  });
}

function accept_answer(
  prospective_connection: RTCPeerConnection,
  answer: string
) {
  prospective_connection.setRemoteDescription(
    new RTCSessionDescription(JSON.parse(answer))
  );
}

let connection_one = new RTCPeerConnection(rtc_config);
let connection_two = new RTCPeerConnection(rtc_config);

let connection_one_channel_promise = establish_data_channel(connection_one);
let connection_two_channel_promise = establish_data_channel(
  connection_two,
  false
);

create_offer(connection_one)
  .then((offer) => {
    create_answer(connection_two, offer).then((answer) => {
      accept_answer(connection_one, answer);
    });
  })
  .then(() => {
    Promise.all([
      connection_one_channel_promise,
      connection_two_channel_promise,
    ]).then((channels) => {
      let channel_one = channels[0];
      let channel_two = channels[1];
      channel_one.send("hello");
      channel_two.send("world");
    });
  });

// Close the connections after 3 seconds
setTimeout(() => {
  connection_one.close();
  connection_two.close();
  console.log("all done");
}, 5000);
