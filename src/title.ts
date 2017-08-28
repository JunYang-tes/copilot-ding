export function titleFreeze() {
  document.title = "Ding"
  //DOT allow modify document.title
  Object.defineProperty(document, 'title', {
    value: "Ding",
    writable: false,
    enumerable: true,
    configurable: true
  });
}