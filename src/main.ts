import { titleFreeze } from "./title"
import { CSSSocket } from "./CSSSocket"
// import * as dingServices from "./ding"
import { delay } from "./utils"
declare var $: (s: string) => { length: number }
declare var require: (s: string) => any
async function startUp() {
  let ready = $("#menu-pannel .user-avatar").length > 0
  while (!ready) {
    await delay(500)
    ready = $("#menu-pannel .user-avatar").length > 0
  }
  const dingServices = require("./ding")
  titleFreeze()
  let csSocket = new CSSSocket(`ws://127.0.0.1:9991/js.ding.`, 4000, () => { }, dingServices)
}
startUp()
  .then(() => console.log("Ding tick ready!"))

