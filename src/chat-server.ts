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
    }

    public start(port: number): void {
        this.io.on("connection", (socket: any) => {
            console.log("michael")
            // socket.emit("authentication", { token: "4712" })
            // socket.on("authenticated", () => {
            // use the socket as usual
            this.chatManager.handleConnect(socket)

            socket.on("disconnect", () => {
                this.chatManager.handleDisConnect(socket)
            })

            socket.on("message", (message: any) => {
                this.chatManager.handleMessage(this.io, JSON.parse(message))
            })

            //            })
        })

        this.http.listen(port, () => {
            console.log(`chat server started on port ${port}`)
        })

        // require("socketio-auth")(this.io, {
        //     authenticate(socket: any, data: any, callback: any): any {
        //         const validTokens: string[] = []
        //         validTokens.push("4712")
        //         //get credentials sent by the client
        //         console.log(data)

        //         //inform the callback of auth success/failure
        //         if (validTokens.some((token: string) => token === data.token)) {
        //             return callback(null, true)
        //         }

        //         return callback(new Error("User not found"))
        //     },
        // })

    }
}

console.log(process.argv[2])

// choose any port number that fits you
const chatServerPort: number = Number(process.argv[2])

const chatServer: ChatServer = new ChatServer(new DefaultChatManager())
chatServer.start(chatServerPort)
