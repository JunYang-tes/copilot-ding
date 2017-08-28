export function delay(ms) {
  return new Promise((res, rej) => {
    setTimeout(res, ms);
  })
}
function promiseify(fn) {
  return (...args) => new Promise((res, rej) => {
    args = [...args, (...ret) => res(...ret)]
    fn(...args)
  })
}

export function active() {
  window.postMessage("active", "*")
}