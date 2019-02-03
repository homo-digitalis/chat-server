import { IChatManager } from "./chat-server"

export class DefaultChatManager implements IChatManager {

    // tslint:disable-next-line:prefer-function-over-method
    public handleConnect(socket: any): void {
        console.log(`user connected ${socket}`)
    }

    public handleDisConnect(socket: any): void {
        console.log("user disconnected")
    }

    public handleMessage(io: any, message: any): void {
        io.emit("message", { type: "message", text: message })
    }

}
