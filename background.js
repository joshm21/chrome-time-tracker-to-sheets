// TABS
// switch between tabs in window

// close one of multiple tabs in window
// close only tab in window
// close background tab
// close last tab
// close all remaining tabs

// open new tab and type url
// update url in existing tab
// open new background tab, switching to it after loaded
// open new background tab, switching to it while loading

// switch between windows without changing tabs
// switch back to chrome from other app
// chrome out of focus

// idle

const MINIMUM_SECONDS_THRESHOLD = 1;

const DOMAINS_TO_NOT_SUBMIT = [null, "newtab"];

let DOMAIN = null;
let START_DATETIME = null;

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

const getWindow = windowId => {
  return new Promise(function(resolve, reject) {
    chrome.windows.get(windowId, function(window) {
      if (window) {
        resolve(window);
      } else {
        reject(Error("Error getting window"));
      }
    });
  });
};

async function handleEvent() {
  try {
    const activeTab = await getSingleActiveTab();
    const window = await getWindow(activeTab.windowId);
    if (window.focused) {
      processActiveTab(activeTab);
    } else {
      onNoActiveTab();
    }
  } catch (error) {
    onNoActiveTab();
  }
}

function getDomain(urlString) {
  let domain;
  try {
    let url = new URL(urlString);
    domain = url.hostname;
  } catch (e) {
    domain = null;
  }
  return domain;
}

function processActiveTab(activeTab) {
  let urlString = activeTab.url;
  let currentDomain = getDomain(urlString);
  if (currentDomain != DOMAIN) {
    submitData();
    DOMAIN = currentDomain;
    START_DATETIME = new Date();
  }
}

function onNoActiveTab() {
  submitData();
  DOMAIN = null;
}

function submitData() {
  if (DOMAINS_TO_NOT_SUBMIT.includes(DOMAIN)) {
    return;
  }
  let durationInSeconds = (new Date() - START_DATETIME) / 1000;
  if (durationInSeconds > MINIMUM_SECONDS_THRESHOLD) {
    submitToSheets(DOMAIN, durationInSeconds);
  }
}

function submitToSheets(domain, duration) {
  console.log(`submitting ${domain} for ${duration} seconds`);
  // let submitUrl = `https://docs.google.com/forms/d/e/1FAIpQLSecMPGUTWI7rinAmGfJSQE-Q13ZpPHLFSY4bL6Gvv8O7n2QxA/formResponse?&entry.607399626=${domain}&entry.1257183468=${duration}&submit=SUBMIT`;
  // fetch(submitUrl, { mode: "no-cors" });
}

chrome.tabs.onActivated.addListener(handleEvent);
chrome.tabs.onRemoved.addListener(handleEvent);
chrome.tabs.onUpdated.addListener(handleEvent);
chrome.windows.onFocusChanged.addListener(handleEvent);
chrome.idle.onStateChanged.addListener(handleEvent);
