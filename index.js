// Timer configuration
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
    startBtn.click();
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
  if (currentSeconds <= 0) {
    if (currentMinutes === 0) {
      // Timer finished
      clearInterval(timerInterval);
      timerState = "stopped";
      startBtn.text("Start");
      startBtn.attr("disabled", false);
      pauseBtn.attr("disabled", true);
      stopBtn.attr("disabled", true);
      pauseBtn.text("Pause");
      timerDemo.removeClass("running", "paused");

      // Auto-start next session
      startNextSession();

      // Show completion notification
      const completedSession = isBreakTime ? "Focus session" : "Break";
      alert(`${completedSession} completed! Starting next session.`);

      return;
    }
    currentMinutes--;
    currentSeconds = 59;
  } else {
    if (currentMinutes === 0 && currentSeconds == 13) {
      new Audio("./assets/end-sound.mp3").play();
    }
    currentSeconds--;
  }
  updateTimerDisplay();
  saveTimerState();
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
  if (timerState === "stopped") {
    new Audio("./assets/start-sound.mp3").play();
    timerState = "running";
    timerDemo.addClass("running");
    timerDemo.removeClass("paused");
    startBtn.attr("disabled", true);
    pauseBtn.attr("disabled", false);
    stopBtn.attr("disabled", false);

    timerInterval = setInterval(runTimer, 1000);
  } else if (timerState === "paused") {
    timerState = "running";
    timerDemo.addClass("running");
    timerDemo.removeClass("paused");
    startBtn.attr("disabled", true);
    pauseBtn.attr("disabled", false);
    // pauseBtn.text("Pause");
    startBtn.text("start");
    timerInterval = setInterval(runTimer, 1000);
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
    // pauseBtn.text("Resume");
    pauseBtn.fadeOut(500);
    saveTimerState();
    clearInterval(timerInterval);
  }
});

stopBtn.on("click", () => {
  timerState = "stopped";
  timerDemo.removeClass("running", "paused");
  startBtn.text("Start");
  startBtn.attr("disabled", false);
  pauseBtn.attr("disabled", true);
  stopBtn.attr("disabled", true);
  //pauseBtn.text("Pause");
  pauseBtn.fadeIn(500);
  clearInterval(timerInterval);
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
    const state = JSON.parse(saved);

    focusTime = state.focusTime || 25;
    shortBreakTime = state.shortBreakTime || 5;
    longBreakTime = state.longBreakTime || 15;
    goalTime = state.goalTime || 5;
    currentSession = state.currentSession || 1;
    isBreakTime = state.isBreakTime || false;
    currentMinutes =
      state.currentMinutes === 0 ? 0 : state.currentMinutes || focusTime;
    currentSeconds = state.currentSeconds || 0;
    timerState = state.timerState || "stopped";
    totalStudyMinutes = state.totalStudyMinutes || 0;
    // console.log(timerState);
    const now = Date.now();
    const elapsed = Math.floor((now - state.lastUpdated) / 1000); // in seconds

    if (timerState === "running") {
      let totalSeconds = currentMinutes * 60 + currentSeconds - elapsed;
      if (totalSeconds <= 0) {
        startNextSession(); // If time's up, go to next session
      } else {
        currentMinutes = Math.floor(totalSeconds / 60);
        currentSeconds = totalSeconds % 60;
        timerInterval = setInterval(runTimer, 1000);
      }
    }

    // Update UI based on loaded state
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
  }
}

loadTimerState();
updateSessionInfo();
updateTimerDisplay();
updateTotalTime();

// function updateTimerDisplay(time) {
//   if (time < 0) {
//     clearInterval(currInterval);
//     timerDisplay.text("Time's up!");
//     return;
//   }
//   const min = Math.floor(time / 60);
//   const sec = time % 60;
//   const formattedSeconds = sec < 10 ? "0" + sec : sec;

//   console.log(min + ":" + formattedSeconds);
//   timerDisplay.text(`${min}:${formattedSeconds}`);
// }

// function updateTotalTime() {
//   const hours = Math.floor(totalStudyMinutes / 60);
//   const minutes = totalStudyMinutes % 60;
//   totalTimeDisplay.text(`${hours}h ${minutes}m`);

//   const progressPercent = Math.min(
//     (totalStudyMinutes / dailyGoalMinutes) * 100,
//     100
//   );
//   progressFill.width(progressPercent + "%");

//   const progressText = $(".progress-text");
//   progressText.text(
//     `${Math.round(progressPercent)}% of daily goal (${Math.floor(
//       dailyGoalMinutes / 60
//     )} hours)`
//   );
// }

// let demoInterval;

// startBtn.on("click", () => {
//   if (timerState === "stopped") {
//     // Start timer
//     timerState = "running";
//     timerDemo.addClass("running");
//     timerDemo.removeClass("paused");
//     // startBtn.text("Resume");
//     startBtn.attr("disabled", true);
//     pauseBtn.attr("disabled", false);
//     stopBtn.attr("disabled", false);
//     timerDisplay.text("24:59");
//     currGoalSeconds--;
//     // Demo: increment total time every 3 seconds
//   } else if (timerState === "paused") {
//     // Resume timer
//     timerState = "running";
//     timerDemo.addClass("running");
//     timerDemo.removeClass("paused");
//     startBtn.attr("disabled", true);
//     // startBtn.inserAfter(pauseBtn);
//     //pauseBtn.insertAfter(startBtn);
//     pauseBtn.fadeIn(500);
//     pauseBtn.attr("disabled", false);
//     pauseBtn.text("Pause");

//     // Resume demo increment
//   }
//   console.log(timerState);
//   totalInterval = setInterval(() => {
//     totalStudyMinutes++;
//     updateTotalTime();
//   }, 60000);
//   currInterval = setInterval(() => {
//     updateTimerDisplay(--currGoalSeconds);
//   }, 1000);
// });

// pauseBtn.on("click", () => {
//   if (timerState === "running") {
//     // Pause timer
//     timerState = "paused";
//     timerDemo.removeClass("running");
//     timerDemo.addClass("paused");
//     startBtn.attr("disabled", false);
//     pauseBtn.fadeOut(500);
//     startBtn.text("Resume");
//     // Stop increment
//     clearInterval(currInterval);
//     clearInterval(totalInterval);
//   }
//   console.log(timerState);
//   //   } else if (timerState === "paused") {
//   //     // Resume timer
//   //     timerState = "running";
//   //     timerDemo.classList.add("running");
//   //     timerDemo.classList.remove("paused");
//   //     startBtn.disabled = true;
//   //     pauseBtn.textContent = "Pause";
//   //   }
// });

// stopBtn.on("click", () => {
//   // Stop timer
//   timerState = "stopped";
//   timerDemo.removeClass("running", "paused");
//   startBtn.text("Start");
//   startBtn.attr("disabled", false);
//   pauseBtn.attr("disabled", true);
//   stopBtn.attr("disabled", true);
//   //pauseBtn.insertAfter(startBtn);
//   pauseBtn.fadeIn(500);
//   console.log(timerState);

//   //   pauseBtn.text("Pause");
//   timerDisplay.text("25:00");
//   currGoalSeconds = 25 * 60;
//   // Stop demo increment
//   clearInterval(totalInterval);
//   clearInterval(currInterval);
// });

// //updateTotalTime();
// //updateTimerDisplay();
