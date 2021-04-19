const POLL_INTERVAL_SECONDS = 5
const SECONDS_UNTIL_IDLE = 15

let ACTIVE_TAB = {}

const pollActiveTab = () => {
  console.log("polling...")
  const idleState = getIdleState()
  const currentTab = getCurrentTab()
  console.log(currentTab.title)
  console.log(ACTIVE_TAB.title)
  const hasActiveTabChanged = currentTab.title == ACTIVE_TAB.title ? true : false
  const isTabPlayingAudio = currentTab.audible

  if (idleState == "active" && !hasActiveTabChanged) {
    incrementActiveTab()
    return
  }

  if (idleState == "active" && hasActiveTabChanged) {
    submitActiveTab()
    updateActiveTab(currentTab)
    return
  }  

  if (idleState == "idle" && !hasActiveTabChanged && isTabPlayingAudio) {
    incrementActiveTab()
    return
  }

  if (idleState == "idle" && !hasActiveTabChanged && !isTabPlayingAudio) {
    submitActiveTab()
    resetActiveTab()
    return
  }

  if (idleState == "locked") {
    submitActiveTab()
    resetActiveTab()
    return
  }

  console.log("uncaught condition")
}

const submitActiveTab = () => {
  console.log("submitting")
  console.log(ACTIVE_TAB)
}

const updateActiveTab = (tab) => {
  ACTIVE_TAB.start = new Date()
  ACTIVE_TAB.url = tab.url || tab.pendingUrl
  ACTIVE_TAB.domain = new URL(ACTIVE_TAB.url).hostname
  ACTIVE_TAB.title = tab.title
  ACTIVE_TAB.seconds = 0
}

const incrementActiveTab = () => {
  ACTIVE_TAB.seconds += POLL_INTERVAL_SECONDS
}

const resetActiveTab = () => {
  ACTIVE_TAB = {
    start: null,
    url: null,
    domain: null,
    title: null,
    seconds: null
  }
}

const getIdleState = () => {
  return chrome.idle.queryState(SECONDS_UNTIL_IDLE, (idleState) => {
    return idleState
  })
}

const getCurrentTab = () => {
  return chrome.tabs.query({"active": true, "lastFocusedWindow": true}, (tabs) => {
    return tabs[0]
  })
}

console.log("starting")
ACTIVE_TAB = resetActiveTab()
setInterval(pollActiveTab,POLL_INTERVAL_SECONDS*100)

// if hasUrlChanged
//   submit
//   startNew
//   return

// if (idle + isAudioPlaying) || (active)
//   increment
//   return

// if idle || locked
//   submit
//   reset
//   return
