const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
var path = require("path");

const app = express();

app.use(express.static(`${__dirname}/static`));

const server = http.createServer(app);
const io = socketIO(server);

app.get("/", function (request, response) {
  response.sendFile(path.join(__dirname, "/index.html"));
});

server.listen(process.env.PORT || 5500, () => {
  console.log("Server ready...");
});

let players = [];
let playersOjb = [];
let ready = [];
let roles = ["impostor", "miet"];

let colors = [
  "black",
  "blue",
  "brown",
  "green",
  "orange",
  "pink",
  "purple",
  "red",
  "white",
  "yellow",
];
shuffle(colors);
let sortedPlayers;
let sortedReady;
io.on("connection", (socket) => {
  socket.on("print", (msg) => {
    console.log(msg);
  });

  socket.on("ready", (player) => {
    ready.push(player);
    io.emit("ready", ready);
    sortedPlayers = players.map((x) => x); //DON'T KNOW HOW THIS WORKS BUT IT WORKS!
    sortedPlayers.sort((a, b) => (a.name > b.name ? 1 : -1));
    sortedReady = ready.map((x) => x);
    sortedReady.sort((a, b) => (a.name > b.name ? 1 : -1));

    if (arraysEqual(sortedPlayers, sortedReady)) {
      for (let i = 0; i < sortedPlayers.length; i++) {
        shuffle(roles);
        let role = roles.splice(Math.floor(Math.random() * roles.length), 1);
        io.to(sortedPlayers[i].name).emit("role", role);
      }
    }

    console.log(players);
    io.emit("updatePlayers", players);
  });

  socket.on("emergency", (msg) => {
    io.emit("emergency", msg, players);
    io.emit("updatePlayers", players);
  });

  socket.on("nameSubmit", (nickname) => {
    console.log(`${nickname} joined the game`);
    socket.emit("nameSubmit", `Welcome ${nickname}!`);
    socket.broadcast.emit("joined", `${nickname} joined the game`);
    socket.nickname = nickname;
    let color = colors.splice(0, 1)[0];
    players.push({
      name: nickname,
      color: color,
      alive: true,
      role: null,
      votes: 0,
    });
    socket.join(nickname);
    console.log(players);
    io.to(socket.nickname).emit("props", colors, players);
    io.emit("updatePlayers", players);
    io.emit("players", players);
  });

  socket.on("vote", (playerVoted, votedBy) => {
    console.log(`playervoted: ${playerVoted} | votedby: ${votedBy}`);
    for (let i = 0; i < players.length; i++) {
      if (players[i].name == playerVoted.name) {
        players[i].votes++;
        console.log(players, "hi", votedBy);
      }
    }
    io.emit("voted", votedBy, players);
  });

  socket.on("eject", (playerToEject) => {
    for (let i = 0; i < players.length; i++) {
      if (players[i].name == playerToEject.name) {
        players[i].alive = false;
      }
    }

    io.emit("updatePlayers", players);
    io.emit("new round");
  });

  socket.on("disconnect", () => {
    io.emit("updatePlayers", players);
    removePlayer(socket.nickname);
    console.log(`${socket.nickname} disconnected`);
    io.emit("disconnected", socket.nickname, players, ready);
  });
});

function removePlayer(player) {
  players = players.filter((e) => e.name !== player);
  ready = ready.filter((e) => e.name !== player);
}

function arraysEqual(a1, a2) {
  // for (let i = 0; i < a1.length; i++) {
  //   if (a2[i].name != undefined) {
  //     if (a1[i].name == a2[i].name) {
  //       console.log("NIIIIIIIIIIIIIICE");
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   }
  // }

  if (JSON.stringify(a1) == JSON.stringify(a2)) {
    return true;
  } else {
    return false;
  }
}

const objectsEqual = (o1, o2) => {
  Object.keys(o1).length === Object.keys(o2).length &&
    Object.keys(o1).every((p) => o1[p] === o2[p]);
};

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
