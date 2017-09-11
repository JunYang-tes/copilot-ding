import { dingApi, IMessage } from "./api"
import { active, notify } from "../utils"
export interface IContact {
  name: string,
  id: string,
  groupName: string
}
export async function search(keywords: string): Promise<IContact[]> {
  let ret = await dingApi.search(keywords)
  return ret.map(c => ({
    name: c.text,
    id: c.id,
    groupName: c.groupName
  }))
}
export function sendMsg(message: IMessage, times) {
  return dingApi.sendMsg(message, times)
}
export function open(id: string) {
  if (dingApi.open(id)) {
    active()
    return true
  } else {
    return false
  }
}
dingApi.onConvActived((opt) => {
  console.log("conv actived")
})
dingApi.onNewMessage(({ message, convInfo }) => {
  notify(convInfo.i18nTitle, convInfo.lastMessageContent)
})