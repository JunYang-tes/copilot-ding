console.log("content script")
window.addEventListener("message", (e) => {
  console.log(e)
  if (e.data === "active") {
    chrome.runtime.sendMessage("active")
  }
})