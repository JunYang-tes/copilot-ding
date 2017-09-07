export function delay(ms) {
  return new Promise((res, rej) => {
    setTimeout(res, ms);
  })
}
// function promiseify(fn) {
//   return (...args) => new Promise((res, rej) => {
//     args = [...args, (...ret) => res(...ret)]
//     fn(...args)
//   })
// }

export function active() {
  window.postMessage("active", "*")
}
export function paste() {
  window.postMessage("paste", "*")
}
export function notify(title: string, content: string) {
  window.postMessage(JSON.stringify({
    type: "notify",
    data: {
      title, content
    }
  }), "*")
}
export function monkeyBefore(obj: any, fnName: string, fn: (...args: any[]) => any) {
  let old = obj[fnName]
  obj[fnName] = function wrapper(...args) {
    let ret = old(...args)
    let newRet = fn(...[...args, ret])
    if (newRet !== undefined) {
      return newRet
    }
    return ret
  }
}