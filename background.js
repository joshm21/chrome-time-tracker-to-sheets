const POLL_INTERVAL_SECONDS = 5
const SECONDS_UNTIL_IDLE = 15


const pollActiveTab = async () => {
  console.log("polling...")
  const idleState = await getIdleState()
  const currentTab = await getCurrentTab()
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

const getIdleState = async () => {
  return await chrome.idle.queryState(SECONDS_UNTIL_IDLE)
}

const getCurrentTab = async () => {
  return await chrome.tabs.query({"active": true, "lastFocusedWindow": true})[0]
}

const initialTab = await getCurrentTab()
let ACTIVE_TAB = updateActiveTab(initialTab)
while (true) {
  console.log("looping")
  await new Promise(r => setTimeout(r, POLL_INTERVAL_SECONDS*1000));
  await pollActiveTab()
}
