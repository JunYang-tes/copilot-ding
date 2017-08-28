
  //Auto-generated
  let script = document.createElement('script')
  script.innerHTML=window.onload=`(function(){
    console.log("Run injected code");
    (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
//Client Serives Provider WebSocket
class CSSSocket {
    constructor(url, reconnectDelay, stateChange, provider) {
        const connect = () => {
            stateChange("connecting");
            console.log("connect ", url);
            this.ws = new WebSocket(url);
            let reconnectTimer;
            this.ws.addEventListener('open', () => {
                stateChange("connected");
            });
            this.ws.addEventListener('message', (event) => __awaiter(this, void 0, void 0, function* () {
                let msg = event.data;
                let callInfo = JSON.parse(msg);
                let { seq, args } = callInfo.data;
                console.log(callInfo);
                if (callInfo.event in provider) {
                    console.log("call", callInfo.event);
                    let result = null;
                    try {
                        result = yield provider[callInfo.event](...args);
                        this.ws.send(JSON.stringify({
                            event: ".response",
                            data: {
                                seq,
                                result
                            }
                        }));
                    }
                    catch (e) {
                        this.ws.send(JSON.stringify({
                            event: ".response",
                            data: {
                                seq,
                                error: e.message
                            }
                        }));
                    }
                }
                console.log('Message from server ', msg);
            }));
            this.ws.addEventListener("close", () => {
                if (this.ws.readyState === WebSocket.CLOSED && !this.closed) {
                    stateChange("close");
                    setTimeout(connect, reconnectDelay);
                }
            });
        };
        connect();
    }
    close() {
        this.closed = true;
        this.ws.close();
    }
}
exports.CSSSocket = CSSSocket;

},{}],2:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
class Ding {
    constructor() {
        this.contacts = {};
        this.searchBar = this.getObject(".select2-search-field", "searchBar2");
        this.searchResult = this.getObject(".search-result ul", "multi");
    }
    getObject(selector, name) {
        let scope = angular.element($(selector)).scope();
        return scope[name];
    }
    search(keyword) {
        return __awaiter(this, void 0, void 0, function* () {
            this.searchBar.activate();
            this.searchBar.keyword = keyword;
            this.searchBar.search();
            while (this.searchBar.isSearching) {
                yield utils_1.delay(500);
            }
            let ret = this.searchResult.searchResult["data"];
            let contacts = ret.map(ret => ret.children)
                .reduce((a, b) => (a.push(...b), a), []);
            for (let c of contacts) {
                this.contacts[c.id] = c;
            }
            return contacts;
        });
    }
    open(id) {
        if (id in this.contacts) {
            this.searchResult.onSelect(this.contacts[id]);
            return true;
        }
    }
}
exports.dingApi = new Ding();

},{"../utils":6}],3:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("./api");
const utils_1 = require("../utils");
function search(keywords) {
    return __awaiter(this, void 0, void 0, function* () {
        let ret = yield api_1.dingApi.search(keywords);
        return ret.map(c => ({
            name: c.text,
            id: c.id,
            groupName: c.groupName
        }));
    });
}
exports.search = search;
function open(id) {
    if (api_1.dingApi.open(id)) {
        utils_1.active();
        return true;
    }
    else {
        return false;
    }
}
exports.open = open;

},{"../utils":6,"./api":2}],4:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const title_1 = require("./title");
const CSSSocket_1 = require("./CSSSocket");
// import * as dingServices from "./ding"
const utils_1 = require("./utils");
function startUp() {
    return __awaiter(this, void 0, void 0, function* () {
        let ready = $("#menu-pannel .user-avatar").length > 0;
        while (!ready) {
            yield utils_1.delay(500);
            ready = $("#menu-pannel .user-avatar").length > 0;
        }
        const dingServices = require("./ding");
        title_1.titleFreeze();
        let csSocket = new CSSSocket_1.CSSSocket(\`ws://127.0.0.1:9991/js.ding.\`, 4000, () => { }, dingServices);
    });
}
startUp()
    .then(() => console.log("Ding tick ready!"))
    .then(() => {
    chrome.tabs.getCurrent(console.log);
});

},{"./CSSSocket":1,"./ding":3,"./title":5,"./utils":6}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function titleFreeze() {
    document.title = "Ding";
    //DOT allow modify document.title
    Object.defineProperty(document, 'title', {
        value: "Ding",
        writable: false,
        enumerable: true,
        configurable: true
    });
}
exports.titleFreeze = titleFreeze;

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function delay(ms) {
    return new Promise((res, rej) => {
        setTimeout(res, ms);
    });
}
exports.delay = delay;
function promiseify(fn) {
    return (...args) => new Promise((res, rej) => {
        args = [...args, (...ret) => res(...ret)];
        fn(...args);
    });
}
function active() {
    window.postMessage("active", "*");
}
exports.active = active;

},{}]},{},[4]);

  })()`
  document.body.appendChild(script)
  