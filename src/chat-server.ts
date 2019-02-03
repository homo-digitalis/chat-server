import { DefaultChatManager } from "./default-chat-manager"

export interface IChatManager {
    handleConnect(socket: any): void
    handleDisConnect(socket: any): void
    handleMessage(io: any, message: any): void
}

export class ChatServer {

    private readonly app: any = require("express")()
    private readonly http: any = require("http")
        .Server(this.app)
    private readonly io: any = require("socket.io")(this.http)

    // tslint:disable-next-line:unnecessary-constructor
    public constructor(private readonly chatManager: IChatManager) {
        //
    }

    public start(port: number): void {
        this.io.on("connection", (socket: any) => {

            this.chatManager.handleConnect(socket)

            socket.on("disconnect", () => {
                this.chatManager.handleDisConnect(socket)
            })

            socket.on("message", (message: any) => {
                this.chatManager.handleMessage(this.io, JSON.parse(message))
            })
        })

        this.http.listen(port, () => {
            console.log(`chat server started on port ${port}`)
        })

    }
}

const chatServerPort: number = 3000 // choose any port number that fits you

const chatServer: ChatServer = new ChatServer(new DefaultChatManager())
chatServer.start(chatServerPort)
