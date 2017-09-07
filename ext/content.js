window.addEventListener("message", (e) => {
  console.log(e)
  switch (e.data) {
    case "active":
      chrome.runtime.sendMessage({ type: "active" })
      break
    case "paste":
      console.log("paste")
      document.execCommand("paste")
      break
    default:
      try {
        let msg = JSON.parse(e.data)
        chrome.runtime.sendMessage(msg)
      } catch (e) { }
      break
  }
})