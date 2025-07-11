// Timer configuration
let startTimestamp = null;
let endTimestamp = null;
let animationFrameId = null;
let focusTime = 25; // minutes
let shortBreakTime = 5; // minutes
let longBreakTime = 15; // minutes
let currentSession = 1;
let maxSessions = 4; // After 4 focus sessions, long break
let isBreakTime = false;
let currentMinutes = focusTime;
let currentSeconds = 0;
let timerInterval;
let goalTime = 5; //hours

const timerDemo = $("#timerDemo");
const timerDisplay = $("#timerDisplay");
const timerLabel = $("#timerLabel");
const sessionType = $("#sessionType");
const sessionCounter = $("#sessionCounter");
const startBtn = $("#startBtn");
const pauseBtn = $("#pauseBtn");
const stopBtn = $("#stopBtn");
const settingsToggle = $("#settingsToggle");
const timerSettings = $("#timerSettings");
const applySettings = $("#applySettings");
const focusMinutesInput = $("#focusMinutes");
const shortBreakMinutesInput = $("#shortBreakMinutes");
const longBreakMinutesInput = $("#longBreakMinutes");
const goalHrsInput = $("#goalHrs");
const totalTimeDisplay = $("#totalTime");
const progressFill = $("#progressFill");

let timerState = "stopped";
let totalStudyMinutes = 0;
//let dailyGoalMinutes = 300;

function updateTimerDisplay() {
  const displayMinutes = String(currentMinutes).padStart(2, "0");
  const displaySeconds = String(currentSeconds).padStart(2, "0");
  timerDisplay.text(`${displayMinutes}:${displaySeconds}`);
  const progressText = $(".progress-text");
  updateTotalTime();
}

function updateSessionInfo() {
  if (isBreakTime) {
    const isLongBreak = currentSession % maxSessions === 0;
    sessionType.text(isLongBreak ? "Long Break" : "Short Break");
    timerLabel.text(isLongBreak ? "Long Break Time" : "Short Break Time");
    timerDemo.removeClass("focus-mode");
    timerDemo.addClass("break-mode");
    new Audio("./assets/keepup-sound.mp3").play();
    //startBtn.click();
  } else {
    sessionType.text("Focus Session");
    timerLabel.text("Focus Time");
    timerDemo.removeClass("break-mode");
    timerDemo.addClass("focus-mode");
    new Audio("./assets/step-into-clarity.mp3").play();
  }
  sessionCounter.text(`Session ${currentSession} of ${maxSessions}`);
}

function updateTotalTime() {
  const hours = Math.floor(totalStudyMinutes / 60);
  const minutes = totalStudyMinutes % 60;
  totalTimeDisplay.text(`${hours}h ${minutes}m`);

  const progressPercent = Math.min(
    (totalStudyMinutes / (goalTime * 60)) * 100,
    100
  );
  progressFill.width(progressPercent + "%");

  const progressText = $(".progress-text");
  progressText.text(
    `${Math.round(progressPercent)}% of daily goal (${Math.floor(
      goalTime
    )} hours)`
  );
}

function resetTimer() {
  if (isBreakTime) {
    const isLongBreak = currentSession % maxSessions === 0;
    currentMinutes = isLongBreak ? longBreakTime : shortBreakTime;
  } else {
    currentMinutes = focusTime;
  }
  currentSeconds = 0;
  updateTimerDisplay();
}

function startNextSession() {
  if (isBreakTime) {
    // Break finished, start next focus session
    isBreakTime = false;
    if (currentSession < maxSessions) {
      currentSession++;
    } else {
      currentSession = 1; // Reset after long break
    }
  } else {
    // Focus session finished, start break
    isBreakTime = true;
    totalStudyMinutes += focusTime; // Add completed focus time
    updateTotalTime();
  }
  updateSessionInfo();
  resetTimer();
}

function runTimer() {
  const now = Date.now();
  let remainingMs = endTimestamp - now;

  if (remainingMs <= 0) {
    cancelAnimationFrame(animationFrameId);
    timerState = "stopped";
    startBtn.text("Start");
    startBtn.attr("disabled", false);
    pauseBtn.attr("disabled", true);
    stopBtn.attr("disabled", true);
    pauseBtn.text("Pause");
    timerDemo.removeClass("running", "paused");

    currentMinutes = 0;
    currentSeconds = 0;
    updateTimerDisplay();
    saveTimerState();

    startNextSession();

    const completedSession = isBreakTime ? "Focus session" : "Break";
    alert(`${completedSession} completed! Starting next session.`);
    return;
  }

  const totalSecondsLeft = Math.floor(remainingMs / 1000);
  currentMinutes = Math.floor(totalSecondsLeft / 60);
  currentSeconds = totalSecondsLeft % 60;

  if (currentMinutes === 0 && currentSeconds === 13) {
    new Audio("./assets/end-sound.mp3").play();
  }

  updateTimerDisplay();
  saveTimerState();

  animationFrameId = requestAnimationFrame(runTimer);
}

function saveTimerState() {
  const state = {
    focusTime,
    shortBreakTime,
    longBreakTime,
    goalTime,
    currentSession,
    isBreakTime,
    currentMinutes,
    currentSeconds,
    timerState,
    totalStudyMinutes,
    lastUpdated: Date.now(),
  };
  console.log(state.timerState);
  localStorage.setItem("timerState", JSON.stringify(state));
}

startBtn.on("click", () => {
  if (timerState === "stopped" || timerState === "paused") {
    const totalTimeMs = (currentMinutes * 60 + currentSeconds) * 1000;
    startTimestamp = Date.now();
    endTimestamp = startTimestamp + totalTimeMs;

    timerState = "running";
    timerDemo.addClass("running");
    timerDemo.removeClass("paused");
    startBtn.attr("disabled", true);
    pauseBtn.attr("disabled", false);
    stopBtn.attr("disabled", false);
    startBtn.text("Start");
    new Audio("./assets/start-sound.mp3").play();
    animationFrameId = requestAnimationFrame(runTimer);
  }
  pauseBtn.fadeIn(500);
});

pauseBtn.on("click", () => {
  if (timerState === "running") {
    timerState = "paused";
    timerDemo.removeClass("running");
    timerDemo.addClass("paused");
    startBtn.attr("disabled", false);
    startBtn.text("Resume");
    pauseBtn.fadeOut(500);

    const now = Date.now();
    const remaining = endTimestamp - now;
    currentMinutes = Math.floor(remaining / 1000 / 60);
    currentSeconds = Math.floor((remaining / 1000) % 60);

    cancelAnimationFrame(animationFrameId);
    saveTimerState();
  }
});

stopBtn.on("click", () => {
  timerState = "stopped";
  timerDemo.removeClass("running", "paused");
  startBtn.text("Start");
  startBtn.attr("disabled", false);
  pauseBtn.attr("disabled", true);
  stopBtn.attr("disabled", true);
  pauseBtn.fadeIn(500);
  cancelAnimationFrame(animationFrameId);
  resetTimer();
  localStorage.removeItem("timerState");
});

settingsToggle.on("click", () => {
  timerSettings.toggleClass("settings-hidden");
});

applySettings.on("click", () => {
  focusTime = parseInt(focusMinutesInput.val()) || 25;
  shortBreakTime = parseInt(shortBreakMinutesInput.val()) || 5;
  longBreakTime = parseInt(longBreakMinutesInput.val()) || 15;
  goalTime = parseInt(goalHrsInput.val()) || 5;

  //   console.log(
  //     focusTime + " " + shortBreakTime + " " + longBreakTime + " " + goalTime
  //   );

  if (timerState === "stopped") {
    resetTimer();
  }

  timerSettings.addClass("settings-hidden");
});

function loadTimerState() {
  const saved = localStorage.getItem("timerState");
  if (saved) {
    try {
      const state = JSON.parse(saved);

      // Load with fallbacks
      focusTime = state.focusTime ?? 25;
      shortBreakTime = state.shortBreakTime ?? 5;
      longBreakTime = state.longBreakTime ?? 15;
      goalTime = state.goalTime ?? 5;
      currentSession = state.currentSession ?? 1;
      isBreakTime = state.isBreakTime ?? false;
      currentMinutes = state.currentMinutes ?? focusTime;
      currentSeconds = state.currentSeconds ?? 0;
      timerState = state.timerState ?? "stopped";
      totalStudyMinutes = state.totalStudyMinutes ?? 0;

      // calculate elapsed time
      const now = Date.now();
      const elapsed = Math.floor((now - (state.lastUpdated ?? now)) / 1000);

      if (timerState === "running") {
        const totalSavedSeconds =
          (state.currentMinutes ?? 0) * 60 + (state.currentSeconds ?? 0);
        const remainingSeconds = totalSavedSeconds - elapsed;

        if (remainingSeconds <= 0) {
          startNextSession();
        } else {
          currentMinutes = Math.floor(remainingSeconds / 60);
          currentSeconds = remainingSeconds % 60;
          startTimestamp = now;
          endTimestamp = now + remainingSeconds * 1000;
          animationFrameId = requestAnimationFrame(runTimer);
        }
      }

      updateSessionInfo();
      updateTimerDisplay();
      updateTotalTime();

      if (timerState === "running") {
        timerDemo.addClass("running");
        startBtn.attr("disabled", true);
        pauseBtn.attr("disabled", false);
        stopBtn.attr("disabled", false);
      } else if (timerState === "paused") {
        startBtn.text("Resume");
        pauseBtn.fadeOut(500);
        startBtn.attr("disabled", false);
        stopBtn.attr("disabled", false);
      }
    } catch (e) {
      console.error("Error loading timer state:", e);
      localStorage.removeItem("timerState"); // clean up bad data
    }
  }
}

loadTimerState();
updateSessionInfo();
updateTimerDisplay();
updateTotalTime();
