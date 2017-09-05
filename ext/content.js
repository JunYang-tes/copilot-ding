console.log("content script")
window.addEventListener("message", (e) => {
  console.log(e)
  switch (e.data) {
    case "active":
      chrome.runtime.sendMessage("active")
      break
    case "paste":
      console.log("paste")
      document.execCommand("paste")
      break
  }
})