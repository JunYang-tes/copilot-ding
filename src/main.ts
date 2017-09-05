import { titleFreeze } from "./title"
import { CSSSocket } from "./CSSSocket"
import { delay } from "./utils"
import { ServicesProxy } from "./copilot-services"

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
  let csSocket = new CSSSocket({
    url: `ws://127.0.0.1:9991/js.ding.`,
    reconnectDelay: 4000,
    stateChange: () => { },
    provider: dingServices,
    timeout: 1000 * 60 * 10
  })
  let servicesProxy = new ServicesProxy(csSocket)
  require("./ui").UI(servicesProxy)

}
startUp()
  .then(() => console.log("Ding tick ready!"))

