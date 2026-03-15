// ELEMENTS
const startBtn = document.getElementById("startBtn");
const researchBtn = document.getElementById("researchBtn");
const themeBtn = document.getElementById("themeBtn");
const timerText = document.getElementById("timer");
const progressBar = document.getElementById("progressBar");
const progressLabel = document.getElementById("progressLabel");
const focusInput = document.getElementById("focusInput");
const breakInput = document.getElementById("breakInput");
const catImg = document.getElementById("catImg");
const assistantText = document.getElementById("assistantText");
const gardenDiv = document.getElementById("flowerGarden");
const distractionCount = document.getElementById("distractionCount");
const weeklyStatsDisplay = document.getElementById("weeklyStats");
const xpDisplay = document.getElementById("xpDisplay");
const xpFill = document.getElementById("xpFill");
const xpText = document.getElementById("xpText");
const levelText = document.getElementById("levelText");
const sounds = ["meow", "purr", "hiss", "whimper"];
sounds.forEach(id => {
  const a = document.getElementById(id);
  a.load(); // preload audio
});



// STATE
let researchMode = false;
let timer = null, time = 0, focusTime = 0, breakTime = 0, onBreak = false;
let distractions = Number(localStorage.getItem("distractions")) || 0;
let garden = JSON.parse(localStorage.getItem("garden")) || [];
let xp = Number(localStorage.getItem("xp")) || 0;
let level = Number(localStorage.getItem("level")) || 1;
let sessions = JSON.parse(localStorage.getItem("sessions")) || [];

// SOUND
let userInteracted = false;

document.addEventListener("click", () => { userInteracted = true; }, { once: true });
document.addEventListener("touchstart", () => { userInteracted = true; }, { once: true });

function play(id) {
  const a = document.getElementById(id);
  if (!a || !userInteracted) return; // don’t play until user interacts
  a.currentTime = 0;
  a.play().catch(() => {});
}


function assistantSay(text) {
  assistantText.innerText = text;
}

// THEME TOGGLE
themeBtn.onclick = function () {
  document.body.classList.toggle("dark");
  themeBtn.innerText = document.body.classList.contains("dark") ? "🌞 Day Mode" : "🌙 Night Mode";
};

// START FOCUS
startBtn.onclick = function () {
  clearInterval(timer);
  focusTime = focusInput.value * 60;
  breakTime = breakInput.value * 60;
  time = focusTime;
  onBreak = false;
  catImg.src = "cat_focus.gif";
  assistantSay("Focus session started!");
  play("meow");
  timer = setInterval(tick, 1000);
};

// TIMER
function tick() {
  time--;
  updateTimer();
  updateProgress();

  if (time <= 0) {
    if (!onBreak) {
      // End of focus session
      growFlower();
      xp += 10;
      saveXP();
      updateXP();
      saveSession(); // <-- LOG SESSION
      distractionCount = 0;
      localStorage.setItem("distractionCount", distractionCount);
      updateStats();
      assistantSay("Time to take a break~");
      catImg.src = "cat_sleep.gif";
      play("purr");
      time = breakTime;
      onBreak = true;
    } else {
      // End of break
      assistantSay("Break finished~ Ready to focus again?");
      catImg.src = "cat_focus.gif";
      clearInterval(timer);
      updateStats();
    }
  }
}

function updateTimer() {
  const m = Math.floor(time / 60);
  const s = time % 60;
  timerText.innerText = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function updateProgress() {
  const total = onBreak ? breakTime : focusTime;
  const percent = ((total - time) / total) * 100;
  progressBar.style.width = percent + "%";
  progressLabel.innerText = Math.round(percent) + "%";
}

// FLOWER LOGIC
function growFlower() {
  if (garden.length === 0) {
    garden.push(1);
  } else {
    const last = garden[garden.length - 1];
    if (last < 4) garden[garden.length - 1]++;
    else garden.push(1);
  }
  localStorage.setItem("garden", JSON.stringify(garden));
  renderGarden();
}

function damageFlower() {
  if (garden.length === 0) return;
  const last = garden[garden.length - 1];
  if (last > 1) garden[garden.length - 1]--;
  else garden.pop();
  localStorage.setItem("garden", JSON.stringify(garden));
  renderGarden();
}

function renderGarden() {
  gardenDiv.innerHTML = "";
  garden.forEach(stage => {
    const img = document.createElement("img");
    img.src = "flower" + stage + ".png";
    img.className = "flower bloom";
    setTimeout(() => img.classList.remove("bloom"), 400);
    gardenDiv.appendChild(img);
  });
}

// LOG DISTRACTION
document.getElementById("logBtn").onclick = function () {
  distractions++;
  localStorage.setItem("distractions", distractions);
  distractionCount.innerText = distractions;
  assistantSay("Stay focused!");
  play("hiss");
  damageFlower();
};

// RESEARCH MODE
researchBtn.onclick = function () {
  researchMode = !researchMode;
  researchBtn.innerText = researchMode ? "Research Mode ON" : "Research Mode OFF";
};

// TAB SWITCH DETECTION
document.addEventListener("visibilitychange", function () {
  if (document.hidden && !researchMode) {
    distractions++;
    localStorage.setItem("distractions", distractions);
    distractionCount.innerText = distractions;
    assistantSay("You switched tabs >:3");
    play("whimper");
    damageFlower();
  }
});

// PET CAT
document.getElementById("assistantCat").onclick = function () {
  assistantSay("Meow~ that tickles~");
  play("meow");
};

// DRAG CAT
const assistant = document.getElementById("assistant")

let dragging=false
let offsetX=0
let offsetY=0

function startDrag(x,y){
  const rect=assistant.getBoundingClientRect()
  offsetX=x-rect.left
  offsetY=y-rect.top
  dragging=true
}

function moveDrag(x,y){
  if(!dragging)return

  assistant.style.left=(x-offsetX)+"px"
  assistant.style.top=(y-offsetY)+"px"
  assistant.style.right="auto"
  assistant.style.bottom="auto"
}

function stopDrag(){
  dragging=false
}

/* desktop */
assistant.addEventListener("mousedown",e=>{
  startDrag(e.clientX,e.clientY)
})

document.addEventListener("mousemove",e=>{
  moveDrag(e.clientX,e.clientY)
})

document.addEventListener("mouseup",stopDrag)

/* mobile */
assistant.addEventListener("touchstart",e=>{
  const t=e.touches[0]
  startDrag(t.clientX,t.clientY)
})

document.addEventListener("touchmove",e=>{
  const t=e.touches[0]
  moveDrag(t.clientX,t.clientY)
})

document.addEventListener("touchend",stopDrag)

// XP & LEVEL
function updateXP() {
  xpDisplay.innerText = `${xp} XP`;
  const xpForLevel = 50 * level;
  xpFill.style.width = `${Math.min(100, (xp / xpForLevel) * 100)}%`;
  xpText.innerText = `${xp} / ${xpForLevel} XP`;
  if (xp >= xpForLevel) {
    level++;
    xp = 0;
    saveXP(); // save new level
    levelText.innerText = `Level ${level}`;
    xpFill.style.width = "0%";
    xpText.innerText = `0 / ${50 * level} XP`;
    play("meow"); // particle or sound for level up
  }
}

// SAVE XP & LEVEL TO LOCALSTORAGE
function saveXP() {
  localStorage.setItem("xp", xp);
  localStorage.setItem("level", level);
}

// WEEKLY SESSIONS
function saveSession() {
  const today = new Date().toDateString();
  sessions.push(today);
  localStorage.setItem("sessions", JSON.stringify(sessions));
  updateWeeklyStats();
}

function updateWeeklyStats() {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const count = sessions.filter(d => new Date(d) >= weekAgo).length;
  weeklyStatsDisplay.innerText = `${count} focus sessions`;
}

// INITIALIZE
updateWeeklyStats();
updateXP();
distractionCount.innerText = distractions;
renderGarden();
