import { delay, monkeyAfter } from "../utils"
import { EventEmitter } from "events"
interface IDingEventHandler {
  once: boolean,
  listenser: Function
}
export interface IDingConvInfo {
  allowedShow: boolean,
  avatarType: number,
  baseConversation: any,
  convId: string,
  i18nTitle: string,
  lastMessageContent: string,
}
interface IDingConvItemController {
  conv: IDingConvInfo
}
interface IConvItem {
  messages: IDingMessage[],
  sdkConv: {
    baseConversation: any,
    cid: string,
    isActive: boolean,
    isPin: boolean,
    isSingleChat: boolean,
    isToMySelf: boolean,
    isUIVisible: boolean,
    messages: IDingMessage[],
    _events: {
      receive_new_message:
      IDingEventHandler[]
    }
  }
}
interface IAllConv {
  [key: string]: IConvItem
}
export interface IDingMessage {
  cancelAble: boolean,
  hasAtMe: boolean,
  baseMessage: {
    createdAt: number,
    creatorType: number,
    messageId: number,
    conversationId: string,
    content: {
      contentType: number,//1 textContent
      textContent?: {
        text: string
      }
    }
  }
}
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
export type UnreadIncrease = ({ total: number }) => any
export interface INewMessageEventArg {
  message: IDingMessage,
  convInfo: IDingConvInfo
}
export type NewMessage = (evt: INewMessageEventArg) => any
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
    monkeyAfter(this.searchResult, "onSelect", (contact: Contact) => {
      this.notifyActive(contact.id)
    })
    monkeyAfter(this.conlist, "tryChangeActiveConv", (cid: string) => {
      this.notifyActive(cid)
    })
    this.watchUnreadMsg()
    this.watchNewMsg()
  }
  private watchNewMsg() {
    const hack = (handler) => {
      if (!handler.__hack) {
        handler.__hack = true
        monkeyAfter(handler, "listener", ({ message }: { message: IDingMessage }) => {
          console.warn(message)
          setTimeout(() => {
            console.log("new msg", message)
            let convItem: IDingConvItemController = this.getObject(`.conv-item[menu-data="${message.baseMessage.conversationId}"]`,
              "convItem"
            )
            this.events.emit("NewMessage", {
              convInfo: convItem.conv,
              message
            })
            console.log(convItem)
          }, 0)
        })
      }
    }
    const hackConvItems = (async () => {
      let allCon = this.getObject("conv-item", "$$childHead", "convItem", "allConv") // $("conv-item").scope().$$childHead.convItem.allConv
      while (!allCon) {
        await delay(100)
        allCon = this.getObject("conv-item", "$$childHead", "convItem", "allConv")
      }
      Object.keys(allCon)
        .forEach(key => {
          let conv: IConvItem = allCon[key]
          let handler = conv.sdkConv._events.receive_new_message[0]
          if (handler) {
            hack(handler)
          }
        })
    })
    // this.onConvActived(hackConvItems)
    let ob = new MutationObserver(hackConvItems)
    ob.observe($(".conv-lists-box")[0], {
      childList: true,
      subtree: true
    })
    hackConvItems()
  }
  private watchUnreadMsg() {
    this.msgCount = this.getObject("all-conv-unread-count",
      "$$childHead", "$ctrl")  // $("all-conv-unread-count").scope().$$childHead.$ctrl
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
          this.events.emit("UnreadIncrease", {
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
  private setValue(selector, value, ...names) {
    let scope = $(selector).scope()
    let name = names[0]
    for (let i = 0; i < names.length - 1; i++) {
      scope = scope[names[i]]
    }
    scope[name] = value
  }
  private getObject(selector, ...names) {
    let scope = angular.element($(selector)).scope()
    for (let name of names) {
      if (scope == undefined) {
        return;
      }
      scope = scope[name]
    }
    return scope
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
  onUnreadIncrease(cb: UnreadIncrease) {
    this.events.on("UnreadIncrease", cb)
  }
  onNewMessage(cb: NewMessage) {
    this.events.on("NewMessage", cb)
  }

  open(id) {
    if (id in this.contacts) {
      this.searchResult.onSelect(this.contacts[id])
      return true
    } else {
      this.conlist.tryChangeActiveConv(id)
    }
  }
  async sendMsg(msg: IMessage, times = 1, delayTime = 0) {
    if (this.open(msg.id)) {
      await delay(500)
      let input = angular.element($(".send-msg-box-wrapper")).scope().input
      let $input = $(".input-msg-box")
      let conv = $input.scope().conv
      while (times-- >= 0) {
        conv.sendTextMsg(msg.message)
        await delay(delayTime)
      }
      return true
    }
    return false
  }
}

export const dingApi = new Ding()