// Meeting URL patterns
const MEETING_PATTERNS = [
  { pattern: /meet\.google\.com\/[a-z]+-[a-z]+-[a-z]+/, name: "Google Meet" },
  { pattern: /zoom\.us\/j\/\d+/, name: "Zoom" },
  { pattern: /teams\.microsoft\.com.*\/meeting/, name: "Microsoft Teams" },
  { pattern: /whereby\.com\//, name: "Whereby" },
  { pattern: /webex\.com\/meet/, name: "Webex" },
];

// Track detected meetings to avoid duplicate notifications
const detectedMeetings = new Set();

// Check if URL is a meeting
function detectMeeting(url) {
  for (const { pattern, name } of MEETING_PATTERNS) {
    if (pattern.test(url)) {
      return name;
    }
  }
  return null;
}

// Show notification
function showNotification(platform, tabId) {
  chrome.notifications.create(`meeting-${tabId}`, {
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: "Meeting Detected!",
    message: `You joined a ${platform} meeting. Click to start recording.`,
    buttons: [
      { title: "Start Recording" },
      { title: "Dismiss" }
    ],
    requireInteraction: true
  });
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const platform = detectMeeting(tab.url);
    
    if (platform && !detectedMeetings.has(tabId)) {
      detectedMeetings.add(tabId);
      showNotification(platform, tabId);
      
      // Store meeting info
      chrome.storage.local.set({
        currentMeeting: {
          platform,
          tabId,
          url: tab.url,
          detectedAt: Date.now()
        }
      });
    }
  }
});

// Listen for tab close to clean up
chrome.tabs.onRemoved.addListener((tabId) => {
  detectedMeetings.delete(tabId);
});

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (buttonIndex === 0) {
    // Start Recording - open mini recorder
    chrome.tabs.create({
      url: "http://localhost:3001/recorder"
    });
  }
  chrome.notifications.clear(notificationId);
});

// Handle notification click
chrome.notifications.onClicked.addListener((notificationId) => {
  chrome.tabs.create({
    url: "http://localhost:3001/recorder"
  });
  chrome.notifications.clear(notificationId);
});

console.log("MeetingIntel background script loaded");
