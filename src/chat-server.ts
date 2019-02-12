// import * as express from "express"
import * as fs from "fs"
// import * as helmet from "helmet"
import * as http from "http"
import * as https from "https"
import * as path from "path"
import { DefaultChatManager } from "./default-chat-manager"

export interface IChatAdministrator {
    handleConnect(socket: any): void
    handleDisConnect(socket: any): void
    handleMessage(io: any, message: any): void
}

export class ChatServer {

    // private readonly server: any = express()
    private readonly app: any = require("express")()
    private readonly http: any = require("http")
        .Server(this.app)
    private readonly io: any = require("socket.io")(this.http)

    public constructor(private readonly administrator: IChatAdministrator) {
        require("socketio-auth")(this.io, {
            authenticate(socket: any, data: any, callback: any): any {
                const validTokens: string[] = []
                validTokens.push("4712")
                if (validTokens.some((token: string) => token === data.token)) {
                    // tslint:disable-next-line:no-null-keyword
                    return callback(null, socket.id)
                } else {
                    socket.emit("authenticationFailed")
                }

                return callback(new Error("User not found"))
            },
        })

    }

    public start(port: number): void {
        this.io.on("connection", (socket: any) => {
            this.administrator.handleConnect(socket)

            socket.on("disconnect", () => {
                this.administrator.handleDisConnect(socket)
            })

            socket.on("message", (message: any) => {
                this.administrator.handleMessage(this.io, JSON.parse(message))
            })

        })

        this.http.listen(port, () => {
            console.log(`chat server started on port ${port}`)
        })

        // if (port === 80) {
        //     this.app.use("/", require("redirect-https")({
        //         body: "<!-- Hello Mr Developer! Please use HTTPS instead -->",
        //     }))
        //     this.startHTTPSServer(server)
        // }

        // this.app.use(helmet())

    }

    private startHTTPSServer(server: any): void {
        try {
            const httpsOptions: any = {
                cert: fs.readFileSync("/etc/letsencrypt/live/www.heidelberg-experience.com/cert.pem"),
                key: fs.readFileSync("/etc/letsencrypt/live/www.heidelberg-experience.com/privkey.pem"),
            }
            https.createServer(httpsOptions, server)
                .listen(443)
            console.log("https listening on port: 443")
        } catch (error) {
            console.log(error.message)
        }
    }
}

// choose any port number that fits you
const chatServerPort: number = Number(process.argv[2])

const chatServer: ChatServer = new ChatServer(new DefaultChatManager())
chatServer.start(chatServerPort)
