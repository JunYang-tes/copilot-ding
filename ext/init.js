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

function promiseify(fn) {
  return (...args) => new Promise((res, rej) => {
    args = [...args, (...ret) => res(...ret)]
    fn(...args)
  })
}

const notify = promiseify(chrome.notifications.create)
const updateNotify = promiseify(chrome.notifications.update)
const getAllNotifications = promiseify(chrome.notifications.getAll)
const queryTab = promiseify(chrome.tabs.query)
const getWindow = promiseify(chrome.windows.get)

chrome.notifications.onClicked.addListener((id) => {
  if (id === funtions._notifyId) {
    functions._notifyId = null
  }
})
async function me() {
  let tab = (await queryTab({ title: "Ding" })).find(t => t.url.startsWith("https://im.dingtalk.com"))
  let win = (await getWindow(tab.windowId))
  console.log(win)
  return win
}


const functions = {
  _notifyId: null,
  active() {
    chrome.tabs.query({
      title: "Ding"
    }, (tabs) => {
      let target = tabs.find(t => t.url.startsWith("https://im.dingtalk.com"))
      chrome.tabs.update(target.id, { active: true })
      chrome.windows.update(target.windowId, { focused: true })
    })
  },
  async notify(data) {
    let win = await me()
    if (win.focused) {
      return
    }

    let all = await getAllNotifications()
    if (functions._notifyId && functions._notifyId in all) {
      updateNotify(functions._notifyId, {
        title: data.title,
        message: data.content
      })
    } else {
      functions._notifyId = await notify({
        type: "basic",
        iconUrl: chrome.runtime.getURL("images/dingtalk.png"),
        title: data.title,
        message: data.content
      })
    }
  }
}
chrome.runtime.onMessage.addListener(async e => {
  if (e.type && functions[e.type]) {
    try {
      await functions[e.type].call(functions, e.data)
    } catch (e) {
      console.log(e)
    }
  }
})