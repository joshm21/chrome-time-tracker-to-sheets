const DEFAULT_CHROME_IDLE_TIME = 60;
const DOMAINS_TO_NOT_SUBMIT = [null, "newtab"];
const MIN_SECONDS_ON_PAGE = 5;

let STORED_DOMAIN = null;
let START_DATETIME = null;

chrome.tabs.onActivated.addListener(handleEvent);
chrome.tabs.onRemoved.addListener(handleEvent);
chrome.tabs.onUpdated.addListener(handleEvent);
chrome.windows.onFocusChanged.addListener(handleEvent);
chrome.idle.onStateChanged.addListener(handleEvent);

async function handleEvent() {
  try {
    const activeTab = await getSingleActiveTab();
    await isWindowFocused(activeTab.windowId);
    await isChromeActive();

    const tabDomain = getDomain(activeTab.url);
    if (tabDomain != STORED_DOMAIN) {
      submitPreviousDomainToSheets();
      STORED_DOMAIN = tabDomain;
      START_DATETIME = new Date();
    }
  } catch (error) {
    submitPreviousDomainToSheets();
    STORED_DOMAIN = null;
  }
}

const getSingleActiveTab = () => {
  return new Promise(function(resolve, reject) {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(
      tabs
    ) {
      if (tabs.length == 1) {
        resolve(tabs[0]);
      } else {
        reject(Error("Error getting single active tab"));
      }
    });
  });
};

const isWindowFocused = windowId => {
  return new Promise(function(resolve, reject) {
    chrome.windows.get(windowId, function(window) {
      if (window.focused) {
        resolve(window);
      } else {
        reject(Error("Window is not focused"));
      }
    });
  });
};

const isChromeActive = () => {
  return new Promise(function(resolve, reject) {
    chrome.idle.queryState(DEFAULT_CHROME_IDLE_TIME, function(idleState) {
      if (idleState == "active") {
        resolve(true);
      } else {
        reject(Error("Chrome is not active"));
      }
    });
  });
};

function getDomain(urlString) {
  try {
    let url = new URL(urlString);
    return url.hostname;
  } catch (e) {
    return null;
  }
}

function submitPreviousDomainToSheets() {
  if (isDataValidToSubmit()) {
    let duration = getDurationInSecondsSinceStart();
    if (isPageDurationAboveMinimum(duration)) {
      console.log(`submitting ${STORED_DOMAIN} for ${duration} seconds`);
      let submitUrl = `https://docs.google.com/forms/d/e/1FAIpQLSecMPGUTWI7rinAmGfJSQE-Q13ZpPHLFSY4bL6Gvv8O7n2QxA/formResponse?&entry.607399626=${STORED_DOMAIN}&entry.1257183468=${duration}&submit=SUBMIT`;
      fetch(submitUrl, { mode: "no-cors" });
    }
  }
}

function isDataValidToSubmit() {
  return !DOMAINS_TO_NOT_SUBMIT.includes(STORED_DOMAIN);
}

function getDurationInSecondsSinceStart() {
  return (new Date() - START_DATETIME) / 1000;
}

function isPageDurationAboveMinimum(duration) {
  return duration > MIN_SECONDS_ON_PAGE;
}
