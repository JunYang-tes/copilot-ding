import { CSSSocket } from "../CSSSocket"
export class ServicesProxy {
  socket: CSSSocket
  constructor(socket: CSSSocket) {
    this.socket = socket
  }
  screentshot(): Promise<void> {
    return this.socket.invoke<void>("screenshot")
  }
}