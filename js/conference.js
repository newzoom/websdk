"use strict";

let id_room = getParameterByName("id_room");
if (!id_room) {
  window.location.replace(`http://${window.location.host}`);
  throw "";
}

if (performance.navigation.type == 1) {
  var url = `http://${window.location.host}/join_meeting.html?id_room=${id_room}`;
  window.location.replace(encodeURI(url));
  throw "";
}

if (u == undefined || u == null) {
  var url = `http://${document.location.host}/login.html?redirect=join_meeting.html?id_room=${id_room}`;
  window.location.href = encodeURI(url);
  throw "";
}

const hangupButton = document.getElementById("hangupButton");
hangupButton.disabled = true;
hangupButton.addEventListener("click", hangup);

const selfCam = document.getElementById("selfCam");
const configuration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

let localStream;
let conn;
const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1,
};
let map = new Map();

async function ask_permission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    selfCam.srcObject = stream;
    localStream = stream;
  } catch (e) {
    console.log("media permission denied");
    localStream = blackSilence();
    selfCam.srcObject = localStream;
  }
}
ask_permission().then(() => call());

async function call() {
  hangupButton.disabled = false;
  if (window["WebSocket"]) {
    conn = new WebSocket(
      `ws://${document.location.host}/ws?token=${u.access_token}&id_room=${id_room}`
    );
    conn.onclose = function (evt) {
      leave();
    };
    conn.onmessage = async function (evt) {
      var { typ, sender_id, receiver_id, data } = JSON.parse(evt.data);
      switch (typ) {
        case 0:
          var desc = await offer(sender_id);
          conn.send(
            JSON.stringify({ typ: 1, receiver_id: sender_id, data: desc })
          );
          break;
        case 1:
          var desc = await answer(sender_id, data);
          conn.send(
            JSON.stringify({ typ: 2, receiver_id: sender_id, data: desc })
          );
          break;
        case 2:
          updateLocal(sender_id, data);
          break;
        case 3:
          updateCandidate(sender_id, data);
          break;
        case 4:
          closePC(sender_id);
          break;
        default:
          console.log("invalid message type", typ);
      }
    };
  } else {
    alert("Your browser does not support WebSockets.");
  }
}

async function offer(id) {
  var pc = new RTCPeerConnection(configuration);
  pc.oniceconnectionstatechange = (e) =>
    console.log("ice connection state", pc.iceConnectionState);
  pc.onicecandidate = (event) => {
    conn.send(
      JSON.stringify({ typ: 3, receiver_id: id, data: event.candidate })
    );
  };
  pc.ontrack = (event) => {
    var el = document.getElementById("remote-vid-" + id);
    if (el === undefined || el === null) {
      el = document.createElement("video");
      el.setAttribute("id", "remote-vid-" + id);
      el.srcObject = event.streams[0];
      el.autoplay = true;
      document.getElementById("hub").appendChild(el);
    }
  };

  await localStream
    .getTracks()
    .forEach((track) => pc.addTrack(track, localStream));
  var d = await pc.createOffer(offerOptions);
  await pc.setLocalDescription(d);
  map.set(id, pc);

  return d;
}

async function answer(id, desc) {
  var pc = new RTCPeerConnection(configuration);
  pc.oniceconnectionstatechange = (e) => console.log(pc.iceConnectionState);
  pc.onicecandidate = (event) => {
    conn.send(
      JSON.stringify({ typ: 3, receiver_id: id, data: event.candidate })
    );
  };
  pc.ontrack = (event) => {
    var el = document.getElementById("remote-vid-" + id);
    if (el === undefined || el === null) {
      el = document.createElement("video");
      el.setAttribute("id", "remote-vid-" + id);
      el.srcObject = event.streams[0];
      el.autoplay = true;
      document.getElementById("hub").appendChild(el);
      return;
    }
  };

  await localStream
    .getTracks()
    .forEach((track) => pc.addTrack(track, localStream));
  pc.setRemoteDescription(desc);
  var d = await pc.createAnswer();
  await pc.setLocalDescription(d);
  map.set(id, pc);

  return d;
}

function updateLocal(id, desc) {
  var pc = map.get(id);
  if (pc === undefined || pc === null) {
    console.log("update local failed, invalid pc", id);
    return;
  }
  pc.setRemoteDescription(desc);
}

function updateCandidate(id, candidate) {
  var pc = map.get(id);
  if (pc === undefined || pc === null) {
    console.log("update candidate failed, invalid pc", id);
    return;
  }
  pc.addIceCandidate(candidate);
}

function closePC(id) {
  var pc = map.get(id);
  if (pc === undefined || pc === null) {
    console.log("close failed, invalid pc", id);
    return;
  }
  pc.close();
  map.delete(id);
  var el = document.getElementById("remote-vid-" + id);
  if (el) {
    el.remove();
  }
}

function hangup() {
  alert("call session ended");
  conn.close();
}

function leave() {
  map.forEach((pc, id) => {
    pc.close();
    map.delete(id);
  });
  hangupButton.disabled = true;
  window.location.replace(`http://${window.location.host}`);
}

let silence = () => {
  let ctx = new AudioContext(),
    oscillator = ctx.createOscillator();
  let dst = oscillator.connect(ctx.createMediaStreamDestination());
  oscillator.start();
  return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
};

let black = ({ width = 640, height = 480 } = {}) => {
  let canvas = Object.assign(document.createElement("canvas"), {
    width,
    height,
  });
  canvas.getContext("2d").fillRect(0, 0, width, height);
  let stream = canvas.captureStream();
  return Object.assign(stream.getVideoTracks()[0], { enabled: false });
};

let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
