//Client Serives Provider WebSocket
export class CSSSocket {
  private ws: WebSocket
  private closed: Boolean
  constructor(url, reconnectDelay: number,
    stateChange: (state: string) => void, provider) {
    const connect = () => {
      stateChange("connecting")
      console.log("connect ", url)
      this.ws = new WebSocket(url)
      let reconnectTimer;
      this.ws.addEventListener('open', () => {
        stateChange("connected")
      })
      this.ws.addEventListener('message', async (event) => {
        let msg = event.data
        let callInfo = JSON.parse(msg)
        let { seq, args } = callInfo.data
        console.log(callInfo)
        if (callInfo.event in provider) {
          console.log("call", callInfo.event)
          let result = null;
          try {
            result = await provider[callInfo.event](...args)
            this.ws.send(JSON.stringify({
              event: ".response",
              data: {
                seq,
                result
              }
            }))
          } catch (e) {
            this.ws.send(JSON.stringify({
              event: ".response",
              data: {
                seq,
                error: e.message
              }
            }))
          }
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
  close() {
    this.closed = true
    this.ws.close()
  }
}