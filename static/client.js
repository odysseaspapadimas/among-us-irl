const game = document.querySelector(".game");
const emergencyBtn = document.querySelector(".emergency");
const name = document.querySelector(".name");
const nameSubmit = document.querySelector(".name-submit");
const nameModal = document.querySelector(".name-modal");
const emergencyModal = document.querySelector(".emergency-modal");
const exitEmerg = document.querySelector('.exit-emerg');
const emergencyMsg = document.querySelector(".emergency-msg");
const buttonMsg = document.querySelector(".button-msg");
const meetingBtn = document.querySelector(".open-meeting");
const readyDiv = document.querySelector(".ready");
const readyBtn = document.querySelector(".ready-btn");
const readyUl = document.querySelector(".players-ready");
const playersUl = document.querySelector(".players");
const playersVoteUl = document.querySelector(".players-modal");
const voteModal = document.querySelector(".vote-modal");
const voteEnd = document.querySelector(".vote-end");
const roleH = document.querySelector(".role");
const killBtn = document.querySelector(".kill");
let killedBtn;

const timer = document.querySelector(".timer");
let startingTime = 20;
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
let roundStarted = false;

if ("vibrate" in navigator) {
  // vibration API supported
  navigator.vibrate =
    navigator.vibrate ||
    navigator.webkitVibrate ||
    navigator.mozVibrate ||
    navigator.msVibrate;
}

const socket = io();

name.focus();

socket.on("updatePlayers", (playersNew) => {
  players = playersNew;
  me = players.filter((player) => {
    return player.name == nickname;
  });
  console.log(players);

  playersUl.innerHTML = ``;
  for (let i = 0; i < players.length; i++) {
    playersUl.innerHTML += `<div class="player">
                                <li>${players[i].name}</li>
                                <img src="img/characters/${players[i].color}.png" alt="">
                                <img src="img/dead.png" class="dead hide" alt="">
                                <button class="killed hide">Killed</button>
                            </div>`;
  }

  for (let i = 0; i < players.length; i++) {
    if (players[i].name == nickname && roundStarted && me[0].role != 'impostor') {
      for (let j = 0; j < playersUl.children.length; j++) {
        if (playersUl.children[j].children[0].innerText == players[i].name) {
          playersUl.children[j].innerHTML = `<li>${players[i].name}</li>
                                              <img src="img/characters/${players[i].color}.png" alt="">
                                              <img src="img/dead.png" class="dead hide" alt="">
                                              <button class="killed">Killed</button>`;
        }
      }
    }
  }

  for (let i = 0; i < players.length; i++) {
    if (players[i].alive == false) {
      console.log("lmafiajsflkafasfddjaf");
      for (let j = 0; j < playersVoteUl.children.length; j++) {
        if (
          playersVoteUl.children[j].children[0].innerText == players[i].name
        ) {
          playersVoteUl.children[j].children[2].classList.remove("hide");
        }
      }
    }
  }

  for (let i = 0; i < players.length; i++) {
    if (players[i].alive == false) {
      console.log("lmafiajsflkafasfddjaf");
      for (let j = 0; j < playersUl.children.length; j++) {
        if (
          playersUl.children[j].children[0].innerText == players[i].name
        ) {
          playersUl.children[j].children[2].classList.remove("hide");
        }
        if(playersUl.children[j].children[0].innerText == players[i].name && players[i] == nickname) {
          playersUl.children[j].children[3].classList.add("hide");
        }
      }
    }
  }
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

  if (navigator.vibrate) {
    // vibration API supported
    navigator.vibrate([300, 150, 300]);
  }
});

socket.on("ready", (readyPlayers) => {
  readyUl.innerHTML = ``;
  for (let i = 0; i < readyPlayers.length; i++) {
    readyUl.innerHTML += `<li class="player">${readyPlayers[i].name} is ready!</li>`;
  }
});

emergencyBtn.addEventListener("click", () => {
  console.log(players, "ALIVLJHALFJHAKSDJFHASDJFH");
  emergencyModal.style.display = "none";
  emergencyBtn.disabled = true;
  emergencyBtn.style.backgroundColor = "gray";
  socket.emit("emergency", nickname);
});

meetingBtn.addEventListener("click", () => {
  emergencyModal.style.display = "block";
});

exitEmerg.addEventListener("click", () => {
  emergencyModal.style.display = "none";
});

voteEnd.addEventListener("click", () => {
  socket.emit("vote end", players);
});

socket.on("new round", () => {

  voteModal.style.display = "none";
  console.log(players,' LMAOOOOOOOO12312313123');
  killedBtn = document.querySelectorAll(".killed");
  killedBtn.forEach((btn) => {
    if (
      btn.parentElement.children[0].innerText == me[0].name &&
      me[0].role != "impostor"
    ) {
      btn.classList.remove("hide");
      btn.addEventListener("click", () => {
        for (let i = 0; i < players.length; i++) {
          if (players[i].name == me[0].name) {
            players[i].alive = false;
            console.log("died");
          }
        }
        console.log(players, "sfasdfadhfkjahfajkfhfkjfjhfjkdshf ALIVEE");
      });
    }
  });
});

killBtn.addEventListener("click", () => {
  navigator.vibrate(500);
  killBtn.disabled = true;
  killBtn.style.backgroundColor = "gray";
  startTimer();
});

let playerVoted;
socket.on("emergency", (msg) => {
  for (let i = 0; i < players.length; i++) {
    if(me[0].alive == false) {
      socket.emit("killed", players);
    }
  }
  emergencyMsg.style.display = "block";
  emergencyMsg.innerText = `${msg} called an emergency meeting!`;
  emergency.play();

  voteModal.style.display = "flex";

  playersUl.innerHTML = ``;
  playersVoteUl.innerHTML = ``;
  if (me[0].name == "1") {
    for (let i = 0; i < players.length; i++) {
      playersVoteUl.innerHTML += `<div class="player">
                                  <li>${players[i].name}</li>
                                  <img src="img/characters/${players[i].color}.png" alt="">
                                  <img src="img/dead.png" class="dead hide" alt="">
                                  <button class="eject">Eject</button>
                                </div>`;
    }
  } else {
    for (let i = 0; i < players.length; i++) {
      playersVoteUl.innerHTML += `<div class="player">
                                  <li>${players[i].name}</li>
                                  <img src="img/characters/${players[i].color}.png" alt="">
                                  <img src="img/dead.png" class="dead hide" alt="">
                                </div>`;
    }
  }

  let ejectBtn = document.querySelectorAll(".eject");
  ejectBtn.forEach(btn => {
    btn.addEventListener('click', () => {
      let playerToEject;
      
      playerToEject = btn.parentElement.children[0].innerText;
      console.log(playerToEject, 'plaertoeject');
      for (let i = 0; i < players.length; i++) {
        if(players[i].name == playerToEject) {
          console.log(players[i], 'playertoeject object');
          players[i].alive = false;
          socket.emit("killed", players);
        }
      }
    });
  });

  if (me[0].name == "1") {
    voteEnd.style.display = "block";
  }
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

socket.on("props", (colorsArr) => {
  colors = colorsArr;
});

socket.on("disconnect", (data) => {
  socket.emit("print", data);
});



socket.on("role", () => {
  //everyone is ready
  roleH.innerHTML = me[0].role;
  roundStarted = true;

  roles.play();
  emergencyBtn.style.display = "inline-block";
  readyDiv.style.display = "none";
  if (me[0].role == "impostor") {
    killBtn.classList.remove("hide");
  }
  killedBtn = document.querySelectorAll(".killed");
  console.log("lololololl");
  killedBtn.forEach((btn) => {
    if (
      btn.parentElement.children[0].innerText == me[0].name &&
      me[0].role != "impostor"
    ) {
      btn.classList.remove("hide");
      btn.addEventListener("click", () => {
        for (let i = 0; i < players.length; i++) {
          if (players[i].name == me[0].name) {
            players[i].alive = false;
            me[0].alive = false;
            console.log("died");
          }
        }
        console.log(players, "ON ROLE KILLED");
      });
    }
  });
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
    killBtn.disabled = false;
    killBtn.style.backgroundColor = "red";
  }
}

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