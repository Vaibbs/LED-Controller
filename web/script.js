const container = document.getElementById("brightnessContainer");
const fill = document.getElementById("brightnessFill");
const percentText = document.getElementById("brightnessPercent");
const toast = document.getElementById("toast");

let isDragging = false;
let toastTimer;

function updateBrightness(clientY) {
  const rect = container.getBoundingClientRect();
  const usableHeight = rect.height - 16;
  const offset = rect.bottom - clientY;

  let percent = (offset / usableHeight) * 100;
  percent = Math.max(0, Math.min(100, Math.round(percent)));

  // Update UI
  fill.style.height = percent + "%";
  percentText.textContent = percent + "%";

  // Show toast
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
  updateBrightness(e.clientY);
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) updateBrightness(e.clientY);
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

/* Touch */
container.addEventListener("touchstart", (e) => {
  updateBrightness(e.touches[0].clientY);
});

container.addEventListener("touchmove", (e) => {
  updateBrightness(e.touches[0].clientY);
});



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
