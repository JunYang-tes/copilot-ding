import { dingApi } from "../ding/api"
import { paste } from "../utils"
import * as _ from "underscore"
import { ServicesProxy } from "../copilot-services"
const icons = {
  img: String.fromCharCode(59219)
}
const screenshot = _.template(`
  <li class="tool-item _hack_screenshot">
    <i class="iconfont tool-icon icon-card tool-icon-bold ng-scope tipper-attached">
      <%= icons.img %>
    </i>
  </li>
`)
export function UI(services: ServicesProxy) {
  dingApi.onConvActived((opt) => {
    let $toolbar = $(".tool-bar")
    $toolbar.append(screenshot({
      icons,
    }))
    $("._hack_screenshot", $toolbar).on("click", async () => {
      await services.screentshot()
      paste()
    })
  })
}
