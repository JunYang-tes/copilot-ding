import { delay } from "../utils"
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

  constructor() {
    this.contacts = {}
    this.searchBar = this.getObject(".select2-search-field", "searchBar2")
    this.searchResult = this.getObject(".search-result ul", "multi")
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
  open(id) {
    if (id in this.contacts) {
      this.searchResult.onSelect(this.contacts[id])
      return true
    }
  }
}

export const dingApi = new Ding()