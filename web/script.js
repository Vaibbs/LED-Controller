  // Toast setup
  const remoteButtons = document.querySelectorAll('.remote button');
  const toast = document.getElementById('toast');
  const toastContent = document.getElementById('toastContent');
let Sync;  
getSync();

async function getSync() {
  try {
    const response = await fetch('/sync'); // replace with your ESP32 IP
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const text = await response.text(); // since it's a manual JSON string
    const data = JSON.parse(text); // convert to JS object
    console.log("Sync data:", data);
    Sync = data;
    return data;
  } catch (err) {
    console.error("Error fetching /sync:", err);
  }
}

  // POST request function
  async function sendSyncData() {
    try {
      const response = await fetch("/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Sync)
      });

      if (response.ok) {
        showToast("✅ Sync request sent successfully!");
      } else {
        showToast("❌ Request failed!");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("⚠️ Network error!");
    }
  }

  // Toast display function
  function showToast(message) {
    toastContent.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  remoteButtons.forEach(button => {
    button.addEventListener('click', () => {
      const buttonText = button.textContent.trim();

      switch (buttonText) {
        case 'BLUE':
          Sync.Color = [0, 0, 255];
          Sync.Strobe = false;
          break;
        case 'RED':
          Sync.Color = [255, 0, 0];
          Sync.Strobe = false;
          break;
        case 'GREEN':
          Sync.Color = [0, 255, 0];
          Sync.Strobe = false;
          break;
        case 'WHITE':
          Sync.Color = [255, 255, 255];
          Sync.Strobe = false;
          break;
        case 'ORANGE':
          Sync.Color = [247, 127, 0];
          Sync.Strobe = false;
          break;
        case 'YELLOW':
          Sync.Color = [252, 191, 73];
          Sync.Strobe = false;
          break;
        case 'CYAN':
          Sync.Color = [0, 180, 216];
          Sync.Strobe = false;
          break;
        case 'PURPLE':
          Sync.Color = [157, 78, 221];
          Sync.Strobe = false;
          break;  
        case 'Auto':
          Sync.BypassSensor = [false, Sync.BypassSensor[1]]
          break;
          case 'Strobe':
          Sync.Strobe = !Sync.Strobe;
          break;
          case 'Fade-':
          Sync.FadeIn -= 100;
          Sync.FadeOut -= 100;
          break;
          case 'Fade+':
          Sync.FadeIn += 100;
          Sync.FadeOut += 100;
          break;
          case 'B+':
          Sync.MaxBrightness += 5;
          break;
          case 'B-':
          Sync.MaxBrightness -= 5;
          break;
          case 'ON':
          Sync.BypassSensor = [true, true];
          break;
          case 'OFF':
          Sync.BypassSensor = [true, false];
          break;
        default:
          Sync.Color = [0, 0, 0];
      }

      showToast(`Button "${buttonText}" pressed`);

      sendSyncData();
    });
  });


  //const openBtn = document.getElementById("openPopup");
    const closeBtn = document.getElementById("closePopup");
    const saveBtn = document.getElementById("saveTime");
    const popup = document.getElementById("popup");

    let startTimeValue = "";
    let endTimeValue = "";

    // Open popup
    //openBtn.addEventListener("click", () => {
      //popup.style.display = "flex";
    //});

    // Close popup
    closeBtn.addEventListener("click", () => {
      popup.style.display = "none";
    });

    // Save time values
    saveBtn.addEventListener("click", () => {
      startTimeValue = document.getElementById("startTime").value;
      endTimeValue = document.getElementById("endTime").value;

      if (startTimeValue && endTimeValue) {
        alert(`Start Time: ${startTimeValue}\nEnd Time: ${endTimeValue}`);
      } else {
        alert("Please select both start and end time.");
      }

      popup.style.display = "none"; // close popup after saving
    });

    // Close popup if clicked outside
    window.addEventListener("click", (e) => {
      if (e.target === popup) {
        popup.style.display = "none";
      }
    });



