const POLL_INTERVAL_SECONDS = 5
const SECONDS_UNTIL_IDLE = 15

let ACTIVE_TAB = {
    start: null,
    url: null,
    domain: null,
    title: null,
    seconds: null
  }

const pollActiveTab = async () => {
  console.log("polling...")
  const state = await chrome.idle.queryState(SECONDS_UNTIL_IDLE)
  const currentTab = await chrome.tabs.query({"active": true, "lastFocusedWindow": true})[0]
  const hasActiveTabChanged = currentTab.title == ACTIVE_TAB.title ? true : false

  if (state == "active" && hasActiveTabChanged) {
    submitActiveTab()
    ACTIVE_TAB.start = new Date()
    ACTIVE_TAB.url = currentTab.url || currentTab.pendingUrl
    ACTIVE_TAB.domain = new URL(ACTIVE_TAB.url).hostname
    ACTIVE_TAB.title = currentTab.title
    ACTIVE_TAB.seconds = 0
    return
  }

  if (state == "active" && !hasActiveTabChanged) {
    ACTIVE_TAB.seconds += POLL_INTERVAL_SECONDS
    return
  }

  if (state == "idle" && !hasActiveTabChanged) {
    if (await chrome.scripting.executeScript(
      {
        target: {tabId: currentTab.id},
        function: isVideoPlaying()
      }
    )) {
      ACTIVE_TAB.seconds += POLL_INTERVAL_SECONDS
    } else {
      submitActiveTab()
      ACTIVE_TAB.title = null
    }
    return
  }

  if (state == "locked") {
    submitActiveTab()
    ACTIVE_TAB.title = null
    return
  }

  console.log("uncaught condition")
}

const submitActiveTab = () => {
  console.log("submitting")
  console.log(ACTIVE_TAB)
}

const isVideoPlaying = () => {
  console.log("checking for running video")
  const videoElement = document.getElementsByTagName('video')[0]
  return (videoElement !== undefined && videoElement.currentTime > 0 && !videoElement.paused && !videoElement.ended && videoElement.readyState > 2)
}

while (true) {
  console.log("looping")
  await pollActiveTab()
  await new Promise(r => setTimeout(r, POLL_INTERVAL_SECONDS*1000));
}
