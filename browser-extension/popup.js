const APP_URL = "http://localhost:3001";

// Check current meeting status
async function checkStatus() {
  const statusEl = document.getElementById("status");
  
  try {
    const data = await chrome.storage.local.get("currentMeeting");
    
    if (data.currentMeeting) {
      const meeting = data.currentMeeting;
      const age = Date.now() - meeting.detectedAt;
      
      // If meeting was detected in last hour, show as active
      if (age < 3600000) {
        statusEl.textContent = `In ${meeting.platform}`;
        statusEl.className = "status-value active";
        return;
      }
    }
    
    statusEl.textContent = "No meeting detected";
    statusEl.className = "status-value inactive";
  } catch (error) {
    statusEl.textContent = "Ready";
    statusEl.className = "status-value inactive";
  }
}

// Open mini recorder
document.getElementById("recordBtn").addEventListener("click", () => {
  chrome.windows.create({
    url: `${APP_URL}/recorder`,
    type: "popup",
    width: 320,
    height: 400,
    left: screen.width - 340,
    top: 100
  });
  window.close();
});

// Open dashboard
document.getElementById("dashboardBtn").addEventListener("click", () => {
  chrome.tabs.create({ url: `${APP_URL}/dashboard` });
  window.close();
});

// Check status on load
checkStatus();
