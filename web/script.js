const container = document.getElementById("brightnessContainer");
const fill = document.getElementById("brightnessFill");
const percentText = document.getElementById("brightnessPercent");
const toast = document.getElementById("toast");

let isDragging = false;
let toastTimer;

function updateBrightness(clientX) {
  const rect = container.getBoundingClientRect();
  const usableWidth = rect.width - 16; // padding (8px left + right)
  const offset = clientX - rect.left;

  let percent = (offset / usableWidth) * 100;
  percent = Math.max(0, Math.min(100, Math.round(percent)));

  // Update UI (horizontal)
  fill.style.width = percent + "%";
  percentText.textContent = percent + "%";

  showToast(percent);
}

function showToast(value) {
  toast.textContent = `Brightness: ${value}%`;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 800);
}

/* Mouse */
container.addEventListener("mousedown", (e) => {
  isDragging = true;
  updateBrightness(e.clientX);
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) updateBrightness(e.clientX);
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

/* Touch */
container.addEventListener("touchstart", (e) => {
  updateBrightness(e.touches[0].clientX);
});

container.addEventListener("touchmove", (e) => {
  updateBrightness(e.touches[0].clientX);
});


//DAY NIGHT TOGGLE CODE

const themeCheckbox = document.getElementById("modeToggle");
const toastBox = document.getElementById("toast");

let toastHideTimer = null;

themeCheckbox.addEventListener("change", () => {
  if (themeCheckbox.checked) {
    displayToast("Day Mode ☀️");
    document.body.classList.add("dark");
  } else {
    displayToast("Night Mode 🌙");
    document.body.classList.remove("dark");
  }
});

function displayToast(textMessage) {
  toastBox.textContent = textMessage;
  toastBox.classList.add("show");

  clearTimeout(toastHideTimer);
  toastHideTimer = setTimeout(() => {
    toastBox.classList.remove("show");
  }, 1000);
}


//TIMER CODE:
const displayTimer = document.getElementById("timerScreen");
const buttonSetTime = document.getElementById("setBtn");
const buttonPlayPause = document.getElementById("playPauseBtn");
const toastElement = document.getElementById("toast");

let storedTotalSeconds = 0;
let activeSecondsLeft = 0;
let isCountdownRunning = false;
let intervalController = null;

/* Convert seconds → HH:MM:SS */
function updateTimerScreen(seconds) {
  const hoursVal = Math.floor(seconds / 3600);
  const minutesVal = Math.floor((seconds % 3600) / 60);
  const secondsVal = seconds % 60;

  displayTimer.textContent =
    String(hoursVal).padStart(2, "0") + ":" +
    String(minutesVal).padStart(2, "0") + ":" +
    String(secondsVal).padStart(2, "0");
}

/* SET button → ask user */
buttonSetTime.addEventListener("click", () => {
  const inputHours = parseInt(prompt("Enter hours (0–23):"), 10) || 0;
  const inputMinutes = parseInt(prompt("Enter minutes (0–59):"), 10) || 0;
  const inputSeconds = parseInt(prompt("Enter seconds (0–59):"), 10) || 0;

  storedTotalSeconds =
    (inputHours * 3600) +
    (inputMinutes * 60) +
    inputSeconds;

  if (storedTotalSeconds <= 0) {
    alert("Please enter a valid time.");
    return;
  }

  activeSecondsLeft = storedTotalSeconds;

  clearInterval(intervalController);
  isCountdownRunning = false;
  buttonPlayPause.textContent = "▶";

  updateTimerScreen(activeSecondsLeft);
});

/* PLAY / PAUSE toggle */
buttonPlayPause.addEventListener("click", () => {
  if (activeSecondsLeft <= 0) return;

  if (!isCountdownRunning) {
    isCountdownRunning = true;
    buttonPlayPause.textContent = "⏸";

    intervalController = setInterval(() => {
      activeSecondsLeft--;
      updateTimerScreen(activeSecondsLeft);

      if (activeSecondsLeft <= 0) {
        clearInterval(intervalController);
        isCountdownRunning = false;
        buttonPlayPause.textContent = "▶";
        showToastMessage("⏰ Timer Finished");
      }
    }, 1000);

  } else {
    isCountdownRunning = false;
    buttonPlayPause.textContent = "▶";
    clearInterval(intervalController);
  }
});

/* Toast */
function showToastMessage(text) {
  toastElement.textContent = text;
  toastElement.classList.add("show");

  setTimeout(() => {
    toastElement.classList.remove("show");
  }, 1200);
}
