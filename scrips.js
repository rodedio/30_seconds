const players = ["Luuk", "Papa", "Mama", "Floris"];

const teamSetupDiv = document.getElementById("teamSetup");
const tussenmenuDiv = document.getElementById("tussenmenu");
const gameScreenDiv = document.getElementById("gameScreen");

const team1PlayersElem = document.getElementById("team1Players");
const team2PlayersElem = document.getElementById("team2Players");
const team1PointsElem = document.getElementById("team1Points");
const team2PointsElem = document.getElementById("team2Points");
const currentPlayerElem = document.getElementById("currentPlayer");

const wordsContainer = document.getElementById("wordsContainer");
const readWordBtn = document.getElementById("readWordBtn");
const goedBtn = document.getElementById("goedBtn");
const volgendeWoordBtn = document.getElementById("volgendeWoordBtn");
const timerDisplay = document.getElementById("timerDisplay");
const timerBeep = document.getElementById("timerBeep");

const nextRoundBtn = document.getElementById("nextRoundBtn");
const randomTeamsBtn = document.getElementById("randomTeamsBtn");
const customTeamsForm = document.getElementById("customTeamsForm");

let teams = { team1: [], team2: [] };
let scores = { team1: 0, team2: 0 };

let currentPlayerIndex = 0;
let allPlayersOrder = [];

let currentWords = [];
let currentWordIndex = 0;
let guessedWords = new Set();
let timeLeft = 30;
let timer = null;

const woordenVoorbeeld = [
  "appel", "boom", "fiets", "huis", "water",
  "zon", "maan", "ster", "auto", "boom"
];

function shuffleArray(arr) {
  let a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function maakTeamsRandom() {
  const shuffledPlayers = shuffleArray(players);
  teams.team1 = shuffledPlayers.slice(0, 2);
  teams.team2 = shuffledPlayers.slice(2, 4);
  scores = { team1: 0, team2: 0 };
  currentPlayerIndex = 0;
  allPlayersOrder = [...teams.team1, ...teams.team2];
  toonTussenmenu();
}

function maakTeamsCustom(formData) {
  const t1 = [];
  const t2 = [];

  for (const speler of players) {
    const teamkeuze = formData.get(speler);
    if (teamkeuze === "team1") {
      t1.push(speler);
    } else if (teamkeuze === "team2") {
      t2.push(speler);
    }
  }

  if (t1.length !== 2 || t2.length !== 2) {
    alert("Je moet precies 2 spelers per team kiezen!");
    return false;
  }

  teams.team1 = t1;
  teams.team2 = t2;
  scores = { team1: 0, team2: 0 };
  currentPlayerIndex = 0;
  allPlayersOrder = [...teams.team1, ...teams.team2];
  toonTussenmenu();
  return true;
}

function toonTussenmenu() {
  teamSetupDiv.classList.add("hidden");
  tussenmenuDiv.classList.remove("hidden");
  gameScreenDiv.classList.add("hidden");

  team1PlayersElem.innerHTML = teams.team1.map(p => `<li>${p}</li>`).join("");
  team2PlayersElem.innerHTML = teams.team2.map(p => `<li>${p}</li>`).join("");
  updateScores();
  updateCurrentPlayer();
  nextRoundBtn.disabled = false;
}

function updateScores() {
  team1PointsElem.textContent = scores.team1;
  team2PointsElem.textContent = scores.team2;
}

function updateCurrentPlayer() {
  currentPlayerElem.textContent = allPlayersOrder[currentPlayerIndex];
}

function startRonde() {
  tussenmenuDiv.classList.add("hidden");
  gameScreenDiv.classList.remove("hidden");
  nextRoundBtn.disabled = true;

  currentWords = shuffleArray(woordenVoorbeeld).slice(0, 10);
  currentWordIndex = 0;
  guessedWords = new Set();
  renderWords();
  readWordBtn.disabled = false;
  goedBtn.disabled = true;
  volgendeWoordBtn.disabled = true;

  timeLeft = 30;
  timerDisplay.textContent = `Tijd: ${timeLeft}`;
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Tijd: ${timeLeft}`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      timerBeep.play();
      alert("Tijd is om!");
      volgendeSpeler();
    }
  }, 1000);
}

function renderWords() {
  wordsContainer.innerHTML = "";
  currentWords.forEach((woord, i) => {
    const div = document.createElement("div");
    div.textContent = woord;
    div.classList.add("word-block");
    if (guessedWords.has(i)) {
      div.classList.add("guessed");
    }
    // Klik alleen woorden aan als het woord de huidige is (om misbruik te voorkomen)
    div.style.cursor = i === currentWordIndex ? "pointer" : "default";
    div.addEventListener("click", () => {
      if (i === currentWordIndex && !guessedWords.has(i)) {
        woordGoedGeraden();
      }
    });
    wordsContainer.appendChild(div);
  });
}

function voorleesWoord() {
  if (currentWordIndex >= currentWords.length) return;
  const woord = currentWords[currentWordIndex];
  const utterance = new SpeechSynthesisUtterance(woord);
  speechSynthesis.speak(utterance);
  // Na voorlezen kan goedBtn aan
  goedBtn.disabled = false;
  readWordBtn.disabled = true;
}

function woordGoedGeraden() {
  if (!guessedWords.has(currentWordIndex)) {
    guessedWords.add(currentWordIndex);
    const woordDivs = wordsContainer.children;
    woordDivs[currentWordIndex].classList.add("guessed");

    const speler = allPlayersOrder[currentPlayerIndex];
    const team = teams.team1.includes(speler) ? "team1" : "team2";
    scores[team]++;

    updateScores();

    goedBtn.disabled = true;
    volgendeWoordBtn.disabled = false;
  }
}

function volgendeWoord() {
  currentWordIndex++;
  if (currentWordIndex >= currentWords.length) {
    alert("Ronde klaar!");
    volgendeSpeler();
  } else {
    renderWords(); // Update de cursors en styling
    readWordBtn.disabled = false;
    goedBtn.disabled = true;
    volgendeWoordBtn.disabled = true;
  }
}

function volgendeSpeler() {
  clearInterval(timer);
  currentPlayerIndex++;
  if (currentPlayerIndex >= allPlayersOrder.length) {
    alert("Einde van het spel! De scores worden gereset.");
    currentPlayerIndex = 0;
    scores = { team1: 0, team2: 0 };
  }
  updateScores();
  updateCurrentPlayer();

  gameScreenDiv.classList.add("hidden");
  tussenmenuDiv.classList.remove("hidden");
  nextRoundBtn.disabled = false;
}

randomTeamsBtn.addEventListener("click", () => {
  maakTeamsRandom();
});

customTeamsForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(customTeamsForm);
  maakTeamsCustom(formData);
});

nextRoundBtn.addEventListener("click", () => {
  startRonde();
});

readWordBtn.addEventListener("click", () => {
  voorleesWoord();
});

goedBtn.addEventListener("click", () => {
  woordGoedGeraden();
});

volgendeWoordBtn.addEventListener("click", () => {
  volgendeWoord();
});
