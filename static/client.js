const emergencyBtn = document.querySelector(".emergency");
const name = document.querySelector(".name");
const nameSubmit = document.querySelector(".name-submit");
const nameModal = document.querySelector(".name-modal");
const emergencyMsg = document.querySelector(".emergency-msg");
const readyBtn = document.querySelector(".ready");
const readyUl = document.querySelector(".players-ready");
const playersUl = document.querySelector(".players");
const roleH = document.querySelector(".role");
let voteBtn;

const fullScreen = document.querySelector(".full-screen");
let isFullScreen = false;

const emergency = new Audio("/sounds/emergency.wav");
const body = new Audio("/sounds/body.wav");
const roles = new Audio("/sounds/roles.wav");

let nickname;
let colors;

const socket = io();

name.focus();

const fullScreenHandler = () => {
  if (!isFullScreen) openFullscreen();
  else closeFullscreen();
};

fullScreen.addEventListener("click", fullScreenHandler);

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

socket.on("emergency", (msg, players) => {
  emergencyMsg.innerText = `${msg} called an emergency meeting!`;
  emergency.play();

  playersUl.innerHTML = ``;
  for (let i = 0; i < players.length; i++) {
    playersUl.innerHTML += `<div class="player">
                                <li>${players[i]}</li>
                                <img src="img/characters/${colors[i]}.png" alt="">
                                <button class="vote ${colors[i]}">Vote</button>
                            </div>`;
  }

  voteBtn = document.querySelectorAll(".vote");
  console.log(voteBtn);
  voteBtn.forEach(btn => {
    btn.addEventListener("click", () => {
      console.log(btn.parentElement.children[0].innerText);
      socket.emit("print", `${btn.parentElement.children[0].innerText} just got voted by ${nickname}`); //btn.classList[1]
    });
  });
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

socket.on("color", (colorsArr) => {
  colors = colorsArr;
});
socket.on("players", (players) => {
  playersUl.innerHTML = ``;
  for (let i = 0; i < players.length; i++) {
    playersUl.innerHTML += `<div class="player">
                                <li>${players[i]}</li>
                                <img src="img/characters/${colors[i]}.png" alt="">
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
                                <img src="img/characters/${colors[i]}.png" alt="">
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



const elem = document.documentElement;

function openFullscreen() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) {
    /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    /* IE/Edge */
    elem.msRequestFullscreen();
  }

  isFullScreen = true;
}

function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    /* Firefox */
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    /* Chrome, Safari and Opera */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    /* IE/Edge */
    document.msExitFullscreen();
  }

  isFullScreen = false;
}
