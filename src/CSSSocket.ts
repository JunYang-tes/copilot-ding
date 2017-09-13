//Client Serives Provider WebSocket
interface IResponse {
  seq: number,
  ret?: any,
  error?: string
}
export interface ICSSSocketOption {
  url: string,
  reconnectDelay: number,
  stateChange: (state: string) => void,
  provider: any,
  timeout: number
}

export class CSSSocket {
  private ws: WebSocket
  private closed: Boolean
  private services: any
  private seq: number
  private timeout: number
  private calls: {
    [seq: number]: {
      res: (ret?: any) => any
      rej: (err: string) => void
    }
  }
  constructor(opt: ICSSSocketOption) {
    let { url, reconnectDelay, stateChange, provider, timeout }
      = opt
    this.timeout = timeout
    this.services = provider
    this.seq = 0
    this.calls = {}
    const connect = () => {
      stateChange("connecting")
      console.log("connect ", url)
      try {

        this.ws = new WebSocket(url)
      } catch (e) {
        setTimeout(connect, reconnectDelay);
        return;
      }
      let reconnectTimer;
      this.ws.addEventListener('open', () => {
        stateChange("connected")
      })
      this.ws.addEventListener('message', async (event) => {
        let msg = event.data
        let callInfo = JSON.parse(msg)
        if (callInfo.event in this) {
          this[callInfo.event].call(this, callInfo.data)
        }
        console.log('Message from server ', msg)
      })
      this.ws.addEventListener("close", () => {
        if (this.ws.readyState === WebSocket.CLOSED && !this.closed) {
          stateChange("close")
          setTimeout(connect, reconnectDelay)
        }
      })
    }
    connect()
  }
  private async call({ seq, method, args }) {
    let provider = this.services
    if (method in provider) {
      let result = null;
      try {
        result = await provider[method](...args)
        this.ws.send(JSON.stringify({
          event: "response",
          data: {
            seq,
            result
          }
        }))
      } catch (e) {
        this.ws.send(JSON.stringify({
          event: "response",
          data: {
            seq,
            error: e.message
          }
        }))
      }
    }
  }
  private response(res: IResponse) {
    let hanlder = this.calls[res.seq]
    if (res.error) {
      hanlder.rej(res.error)
    } else if (res.ret) {
      hanlder.res(res.ret)
    } else {
      hanlder.res()
    }
  }

  public invoke<T>(method: string, ...args: any[]): Promise<T> {
    let seq = this.seq++
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        event: "call",
        data: {
          method,
          seq,
          args
        }
      }))
    } else {
      throw new Error("ENOTREADY");
    }
    return new Promise((res, rej) => {
      let clr = setTimeout(() => {
        delete this.calls[seq]
        rej(new Error("ETIMEOUT"))
      }, this.timeout)
      this.calls[seq] = {
        res: (ret: T) => {
          clearTimeout(clr)
          res(ret)
        },
        rej
      }
    })
  }

  close() {
    this.closed = true
    this.ws.close()
  }
}