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
let ready = [];
let roles = ["impostor", 'miet'];

let colors = ['black', 'blue', 'brown', 'green', 'orange', 'pink', 'purple', 'red', 'white', 'yellow'];
shuffle(colors);

io.on("connection", (socket) => {
  socket.on("print", (msg) => {
    console.log(msg);
  });

  socket.on("ready", (player) => {
    ready.push(player);
    io.emit("ready", ready);

    if (arraysEqual(players, ready)) {
      for (let i = 0; i < players.length; i++) {
        shuffle(roles);
        let role = roles.splice(Math.floor(Math.random() * roles.length), 1);
        io.to(players[i]).emit("role", role);
      }
    }
  });

  socket.on("emergency", (msg) => {
    io.emit("emergency", msg, players);
    app.get('/restart', function (req, res, next) {
      process.exit(1);
    });
  });

  

  socket.on("nameSubmit", (nickname) => {
    console.log(`${nickname} joined the game`);
    socket.emit("nameSubmit", `Welcome ${nickname}!`);
    socket.broadcast.emit("joined", `${nickname} joined the game`);
    socket.nickname = nickname;

    players.push(nickname);
    socket.join(nickname);
    console.log(players);
    io.to(socket.nickname).emit('color', colors);
    io.emit("players", players);
  });

  socket.on("disconnect", () => {
    removePlayer(socket.nickname);
    console.log(`${socket.nickname} disconnected`);
    io.emit("disconnected", socket.nickname, players, ready);
  });
});

function removePlayer(player) {
  players = players.filter((e) => e !== player);
  ready = ready.filter((e) => e !== player);
}

function arraysEqual(_arr1, _arr2) {
  if (
    !Array.isArray(_arr1) ||
    !Array.isArray(_arr2) ||
    _arr1.length !== _arr2.length
  )
    return false;

  var arr1 = _arr1.concat().sort();
  var arr2 = _arr2.concat().sort();

  for (var i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }

  return true;
}


function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

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
