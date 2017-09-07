import { delay, monkeyBefore } from "../utils"
import { EventEmitter } from "events"

export interface IContactGroup {
  children: Contact[],
  text: string,
  source: number,
  type: number,
  uuid: string
}
export interface Contact {
  groupName: string,
  id: string,
  index: number,
  searchEntry: number,
  searchTab: number,
  text: string,
  uuid: string,
  user: any
}
export interface IMessage {
  id: string,
  message: string
}
export type ActiveConvListener = (opt: { cid: string }) => any
export type NewMsg = ({ total: number }) => any

interface IMsgCount {
  unreadMsgCount: number,
  unreadMsgCountForDisplay: number
}
interface IConListScope {
  convList: {
    convListObj: {
      activeConvId: string,
      lastActiveConvId: string,
      isLoading: boolean
    }
    showType: string[]
  },
  tryChangeActiveConv: (cid: string) => any
}

declare module Angluar {
  export interface angular {
    element: (selector: any) => {
      scope: () => any
    }
  }
}

declare var angular: Angluar.angular
declare var $: (s: string) => any

class Ding {
  private contacts: {
    [id: string]: Contact
  }
  private searchBar: {
    activate: () => void
    close: () => void
    keyword: string
    search: () => void
    isSearching: boolean
  }
  private searchResult: {
    searchResult: { [name: string]: IContactGroup[] }
    onSelect: (contact: Contact) => void
  }
  private conlist: IConListScope
  private msgCount: IMsgCount

  private events: any // ??

  constructor() {
    this.contacts = {}
    this.events = new EventEmitter()
    this.searchBar = this.getObject(".select2-search-field", "searchBar2")
    this.searchResult = this.getObject(".search-result ul", "multi")
    this.conlist = $(".conv-lists").scope().$parent
    let activeConv = this.conlist.tryChangeActiveConv
    const self = this
    monkeyBefore(this.searchResult, "onSelect", (contact: Contact) => {
      this.notifyActive(contact.id)
    })
    monkeyBefore(this.conlist, "tryChangeActiveConv", (cid: string) => {
      this.notifyActive(cid)
    })
    this.watchUnreadMsg()
  }
  private watchUnreadMsg() {
    this.msgCount = $("all-conv-unread-count").scope().$$childHead.$ctrl
    let initial = this.msgCount.unreadMsgCount
    let value = initial
    Object.defineProperty(this.msgCount, "unreadMsgCount", {
      get: () => {
        return value
      },
      set: (v) => {
        value = v;
        this.events.emit("UnreadChanged")
        if (value > initial) {
          this.events.emit("NewMsg", {
            total: value
          })
        }
        initial = value
      }
    })
  }

  private notifyActive(cid) {
    new Promise(async (res, rej) => {
      let c = 100 * 10 * 3
      while (this.conlist.convList.convListObj.activeConvId !== cid && c > 0) {
        await delay(100)
        c /= 100
      }
      if (this.conlist.convList.convListObj.activeConvId === cid) {
        res()
      } else {
        rej()
      }
    })
      .then(() => {
        this.events.emit("ConvActived", { cid })
      })
  }
  private getObject(selector, name) {
    let scope = angular.element($(selector)).scope()
    return scope[name]
  }
  async search(keyword): Promise<Contact[]> {
    this.searchBar.activate()
    this.searchBar.keyword = keyword
    this.searchBar.search()
    while (this.searchBar.isSearching) {
      await delay(500)
    }
    let ret: IContactGroup[] = this.searchResult.searchResult["data"]
    let contacts = ret.map(ret => ret.children)
      .reduce((a, b) => (a.push(...b), a), [])

    for (let c of contacts) {
      this.contacts[c.id] = c
    }
    return contacts
  }

  onConvActived(cb: ActiveConvListener) {
    this.events.on("ConvActived", cb)
  }
  onNewMsg(cb: NewMsg) {
    this.events.on("NewMsg", cb)
  }

  open(id) {
    if (id in this.contacts) {
      this.searchResult.onSelect(this.contacts[id])
      return true
    } else {
      this.conlist.tryChangeActiveConv(id)
    }
  }
  async sendMsg(msg: IMessage, times = 1) {
    if (this.open(msg.id)) {
      await delay(500)
      let input = angular.element($(".send-msg-box-wrapper")).scope().input
      let $input = $(".input-msg-box")
      let conv = $input.scope().conv
      while (times-- >= 0) {
        conv.sendTextMsg(msg.message)
      }
      return true
    }
    return false
  }
}

export const dingApi = new Ding()