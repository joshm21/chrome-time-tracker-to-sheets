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
  const state = await chrome.idle.queryState(SECONDS_UNTIL_IDLE)
  switch (state) {
    case "active":
      const activeTab = await chrome.tabs.query({"active": true, "lastFocusedWindow": true})[0]
      increment seconds or 
      submit and update
      break

    case "idle":
      // check for video
      increment seconds or 
      submit and reset
      break
    case "locked":
      submitActiveTab()
      resetActiveTab()
      break
    default:
      break
  }
}



const submitActiveTab = () => {

}

const resetActiveTab = () => {

}

while (true) {
  pollActiveTab()
}
