chrome.webRequest.onHeadersReceived.addListener((e) => {
  let responseHeaders = e.responseHeaders
  let csp = responseHeaders.find(e => e.name === "Content-Security-Policy")
  if (csp) {
    let values = csp.value.split(";")
    for (let i = 0; i < values.length; i++) {
      if (values[i].trim().startsWith("connect-src")) {
        console.log(values[i])
        values[i] += " ws://127.0.0.1:9991/js.ding."
        console.log(values[i])
      }
    }
    csp.value = values.join(";")
  }
  return {
    responseHeaders: e.responseHeaders
  }
}, { urls: ["https://im.dingtalk.com/*"] }, ["responseHeaders", "blocking"])

chrome.runtime.onMessage.addListener(e => {
  if (e === "active") {
    chrome.tabs.query({
      title: "Ding"
    }, (tabs) => {
      let target = tabs.find(t => t.url.startsWith("https://im.dingtalk.com"))
      chrome.tabs.update(target.id, { active: true })
      chrome.windows.update(target.windowId, { focused: true })
    })
  }
})