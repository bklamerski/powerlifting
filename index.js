const express = require("express");
const app = express();
const path = require("path");
const expressWs = require("express-ws")(app);

const PORT = process.env.PORT || 3000;

const rooms = new Map();

function createRoom(roomData, ownerWs) {
  const room = rooms.get(roomData.name);
  if (room) {
    if (roomData.password === room.password) {
      room.ownerWs = ownerWs;
      return { type: "createResult", data: "room already exists" };
    }
    return { type: "createResult", data: "incorrect password" };
  }
  rooms.set(roomData.name, {
    ...roomData,
    refereePositions: [],
    ownerWs,
    votes: [],
  });
  setTimeout(() => {
    rooms.delete(roomData.name);
  }, 3600 * 1000 * 12);
  return {
    type: "createResult",
    data: { result: "room created", name: roomData.name },
  };
}

function refereeJoin(data) {
  const room = rooms.get(data.name);
  if (room) {
    if (data.password === room.password) {
      if (
        room.refereePositions.includes(data.refereePosition) &&
        data.rejoiningPosition !== data.refereePosition
      ) {
        return { type: "joinResult", data: "pozycja już zajęta" };
      } else {
        if (data.rejoiningPosition === null) {
          room.refereePositions.push(data.refereePosition);
        }
        return { type: "joinResult", data: data.refereePosition };
      }
    } else {
      return { type: "joinResult", data: "nieprawidłowe hasło" };
    }
  }
  return { type: "joinResult", data: "Zawody nie istnieją" };
}

function refereeVote(data) {
  const room = rooms.get(data.contest);
  if (room) {
    if (room.votes.some((vote) => vote.refPosition === data.position)) {
      return { type: "refVoteResponse", data: "already voted" };
    }

    room.votes.push({ refPosition: data.position, decision: data.decision });

    if (room.votes.length === 3) {
      room.ownerWs.send(
        JSON.stringify({ type: "votingResult", data: room.votes })
      );
      room.votes.splice(0, room.votes.length);
    }
    return { type: "refVoteResponse", data: "vote success" };
  }
  return { type: "refVoteResponse", data: "room doesnt exist, vote failed" };
}

app.use("/", express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/public/index.html"));
});

app.ws("/", function (ws, req) {
  ws.on("message", function (msg) {
    const msgJson = JSON.parse(msg);
    console.log(msgJson);
    if (msgJson.type === "create") {
      ws.send(JSON.stringify(createRoom(msgJson.data, ws)));
    } else if (msgJson.type === "ref join") {
      ws.send(JSON.stringify(refereeJoin(msgJson.data)));
    } else if (msgJson.type === "ref-vote") {
      ws.send(JSON.stringify(refereeVote(msgJson.data)));
    }
  });
});

app.listen(PORT);

console.log("start");
