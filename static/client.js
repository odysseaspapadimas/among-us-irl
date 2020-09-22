const emergencyBtn = document.querySelector(".emergency");
const name = document.querySelector(".name");
const nameSubmit = document.querySelector(".name-submit");
const nameModal = document.querySelector(".name-modal");
const emergencyMsg = document.querySelector(".emergency-msg");
const readyBtn = document.querySelector(".ready");
const readyUl = document.querySelector(".players-ready");
const playersUl = document.querySelector(".players");
const roleH = document.querySelector(".role");

const emergency = new Audio("/sounds/emergency.wav");
const body = new Audio("/sounds/body.wav");
const roles = new Audio("/sounds/roles.wav");

let nickname;
let playerColor;


const socket = io();

name.focus();

readyBtn.addEventListener("click", () => {
  socket.emit("ready", nickname);

  readyBtn.disabled = true;
  readyBtn.style.backgroundColor = `green`;
});

socket.on("ready", (readyPlayers) => {
  readyUl.innerHTML = ``;
  for (let i = 0; i < readyPlayers.length; i++) {
    readyUl.innerHTML += `<li class="player">${readyPlayers[i]} is ready!</li>`;
  }
});

emergencyBtn.addEventListener("click", () => {
  socket.emit("emergency", nickname);
});

socket.on("emergency", (msg) => {
  emergencyMsg.innerText = `${msg} called an emergency meeting!`;
  emergency.play();
});

nameSubmit.addEventListener("click", (e) => {
  e.preventDefault();
  nickname = name.value;
  socket.emit("nameSubmit", nickname);
});

socket.on("nameSubmit", (msg) => {
  console.log(msg);
  nameModal.style.display = "none";
});

socket.on("joined", (msg) => {
  console.log(msg);
});

socket.on('color', color => {
    playerColor = color;
    console.log(playerColor);
})
socket.on("players", (players) => {
  playersUl.innerHTML = ``;
  for (let i = 0; i < players.length; i++) {
    playersUl.innerHTML += `<div class="player">
                                <li>${players[i]}</li>
                                <img src="img/characters/${playerColor}.png" alt="">
                            </div>`;
  }
});

socket.on("disconnect", (data) => {
  socket.emit("print", data);
});

socket.on("disconnected", (nickname, players, readyPlayers) => {
  console.log(`${nickname} disconnected`);
  playersUl.innerHTML = ``;
  for (let i = 0; i < players.length; i++) {
    playersUl.innerHTML += `<div class="player">
                                <li>${players[i]}</li>
                                <img src="img/characters/${playerColor}.png" alt="">
                            </div>`;
  }

  readyUl.innerHTML = ``;
  for (let i = 0; i < readyPlayers.length; i++) {
    readyUl.innerHTML += `<li class="player">${readyPlayers[i]} is ready!</li>`;
  }
});

socket.on("role", (role) => {
  roleH.innerHTML = role;
  roles.play();
});
