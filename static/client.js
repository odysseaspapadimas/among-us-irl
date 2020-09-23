const game = document.querySelector(".game");
const emergencyBtn = document.querySelector(".emergency");
const name = document.querySelector(".name");
const nameSubmit = document.querySelector(".name-submit");
const nameModal = document.querySelector(".name-modal");
const emergencyModal = document.querySelector(".emergency-modal");
const emergencyMsg = document.querySelector(".emergency-msg");
const meetingBtn = document.querySelector(".open-meeting");
const readyDiv = document.querySelector(".ready");
const readyBtn = document.querySelector(".ready-btn");
const readyUl = document.querySelector(".players-ready");
const playersUl = document.querySelector(".players");
const playersVoteUl = document.querySelector(".players-modal");
const voteModal = document.querySelector(".vote-modal");
const roleH = document.querySelector(".role");

const timer = document.querySelector(".timer");
let startingTime = 2;
let time = startingTime;
let timeInterval;

let voteBtn;

const fullScreen = document.querySelector(".full-screen");
let isFullScreen = false;

const emergency = new Audio("/sounds/emergency.wav");
const body = new Audio("/sounds/body.wav");
const roles = new Audio("/sounds/roles.wav");

let nickname;
let me;
let colors;
let players;
let playerToEject = {};

const socket = io();

name.focus();

socket.on("updatePlayers", (playersNew) => {
  players = playersNew;
  console.log(players);
  for (let i = 0; i < players.length; i++) {
    if (players[i].alive == false) {
      for (let j = 0; j < playersVoteUl.children.length; j++) {
        if (
          playersVoteUl.children[j].children[0].innerText == players[i].name
        ) {
          playersVoteUl.children[j].children[4].classList.remove("hide");
        }
      }
    }
  }
  console.log(players);
});

const fullScreenHandler = () => {
  if (!isFullScreen) openFullscreen();
  else closeFullscreen();
};

fullScreen.addEventListener("click", fullScreenHandler);

readyBtn.addEventListener("click", () => {
  socket.emit("ready", me[0]);
  console.log(me, "mee");
  readyBtn.disabled = true;
  readyBtn.style.backgroundColor = `green`;
});

socket.on("ready", (readyPlayers) => {
  readyUl.innerHTML = ``;
  for (let i = 0; i < readyPlayers.length; i++) {
    readyUl.innerHTML += `<li class="player">${readyPlayers[i].name} is ready!</li>`;
  }
});

emergencyBtn.addEventListener("click", () => {
  socket.emit("emergency", nickname);
  emergencyModal.style.display = "none";
});

meetingBtn.addEventListener("click", () => {
  emergencyModal.style.display = "block";
});

let playerVoted;
socket.on("emergency", (msg, players) => {
  emergencyMsg.style.display = "block";
  emergencyMsg.innerText = `${msg} called an emergency meeting!`;
  emergency.play();

  voteModal.style.display = "block";
  startTimer();

  playersUl.innerHTML = ``;
  playersVoteUl.innerHTML = ``;
  for (let i = 0; i < players.length; i++) {
    playersVoteUl.innerHTML += `<div class="player">
                                <li>${players[i].name}</li>
                                <img src="img/characters/${players[i].color}.png" alt="">
                                <button class="vote ${players[i].color}">Vote</button>
                                <img src="img/ivoted.png" style="width: 40px" class="voted hide" alt="">
                                <img src="img/dead.png" class="dead hide" alt="">`;
  }

  voteBtn = document.querySelectorAll(".vote");
  voteBtn.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      voteBtn.forEach((btn) => {
        btn.disabled = true;
        btn.style.backgroundColor = "gray";
      });
      for (let i = 0; i < players.length; i++) {
        if (e.target.classList[1] == players[i].color) {
          playerVoted = players[i];
        }
      }
      socket.emit("vote", playerVoted, me[0]); //btn.classList[1]
    });
  });
});
let curPlayers;
socket.on("voted", (votedBy, players) => {
  curPlayers = players;
  for (let i = 0; i < players.length; i++) {
    if (players[i].name == votedBy.name) {
      for (let i = 0; i < playersVoteUl.children.length; i++) {
        if (playersVoteUl.children[i].children[0].innerText == votedBy.name) {
          playersVoteUl.children[i].children[3].classList.remove("hide");
        }
      }
    }
  }
});

socket.on("new round", () => {
  setTimeout(() => {
    voteModal.style.display = "none";
    console.log("sup bitch");
    playersUl.innerHTML = ``;
    for (let i = 0; i < players.length; i++) {
      if (players[i].alive == true) {
        playersUl.innerHTML += `<div class="player">
                                  <li>${players[i].name}</li>
                                  <img src="img/characters/${players[i].color}.png" alt="">
                                  <img src="img/dead.png" class="dead hide" alt="">`;
      } else {
        playersUl.innerHTML += `<div class="player">
                                  <li>${players[i].name}</li>
                                  <img src="img/characters/${players[i].color}.png" alt="">
                                  <img src="img/dead.png" class="dead" alt="">`;
      }
    }
  }, 2000);
});

nameSubmit.addEventListener("click", (e) => {
  e.preventDefault();
  nickname = name.value;
  socket.emit("nameSubmit", nickname);
  game.style.display = "block";
  console.log(nickname, " hiii");
});

socket.on("nameSubmit", (msg) => {
  console.log(msg);
  nameModal.style.display = "none";
});

socket.on("joined", (msg) => {
  console.log(msg);
});

socket.on("props", (colorsArr, players) => {
  colors = colorsArr;
  me = players.filter((player) => {
    return player.name == nickname;
  });
});

socket.on("players", (players) => {
  playersUl.innerHTML = ``;
  for (let i = 0; i < players.length; i++) {
    playersUl.innerHTML += `<div class="player">
                                <li>${players[i].name}</li>
                                <img src="img/characters/${players[i].color}.png" alt="">
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
                                <li>${players[i].name}</li>
                                <img src="img/characters/${players[i].color}.png" alt="">
                            </div>`;
  }

  readyUl.innerHTML = ``;
  for (let i = 0; i < readyPlayers.length; i++) {
    readyUl.innerHTML += `<li class="player">${readyPlayers[i]} is ready!</li>`;
  }
});

socket.on("role", (role) => {
  //everyone is ready
  roleH.innerHTML = role;

  roles.play();
  emergencyBtn.style.display = "inline-block";
  readyDiv.style.display = "none";
});

//Vote countdown
function startTimer() {
  updateTimer(true);

  timeInterval = setInterval(() => {
    updateTimer(true);
  }, 1000);
}

function updateTimer(update) {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;

  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  timer.innerHTML = `${minutes}:${seconds}`;

  //Update the timer AND countdown
  if (update) {
    time--;
  }

  //Lose
  if (time < 0) {
    clearInterval(timeInterval);
    eject();
  }
}

function eject() {
  let maxVotes = 0;
  for (let i = 0; i < curPlayers.length; i++) {
    if (curPlayers[i].votes > maxVotes) {
      console.log(curPlayers[i].votes, "here");
      maxVotes = curPlayers[i];
    }
  }
  socket.emit("eject", maxVotes);
}

socket.on("eject", (players, playerToEject) => {
  for (let i = 0; i < players.length; i++) {
    if (players[i].name == playerToEject.name) {
    }
  }
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
