import { dingApi } from "./api"
import { active } from "../utils"
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
export function open(id: string) {
  if (dingApi.open(id)) {
    active()
    return true
  } else {
    return false
  }
}