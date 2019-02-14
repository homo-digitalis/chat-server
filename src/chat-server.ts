import * as express from "express"
import * as fs from "fs"
import * as helmet from "helmet"
import * as http from "http"
import * as https from "https"
import { HTTPSProvider } from "https-provider"
import * as path from "path"
import { DefaultChatManager } from "./default-chat-manager"

export interface IChatAdministrator {
    handleConnect(socket: any): void
    handleDisConnect(socket: any): void
    handleMessage(io: any, message: any): void
}

export class ChatServer {

    // private readonly http: any = require("http")
    //     .Server(this.expressApp)
    // private readonly https: any = require("https")
    //     .Server(this.expressApp)

    // private readonly io: any = require("socket.io")(this.https)

    private readonly expressApp: any = express()
    private readonly options: any
    private readonly server: any
    private readonly io: any

    public constructor(private readonly administrator: IChatAdministrator) {

        console.log(process.env.NODE_ENV)
        if (process.env.NODE_ENV === "production") {
            console.log("starting https")
            this.options = new HTTPSProvider("chat-server-certificate").provideHTTPSOptions()
            this.server = https.createServer(this.options, this.expressApp)
        } else {
            console.log("starting http")
            this.server = http.createServer(this.expressApp)
        }

        this.io = require("socket.io")(this.server)

        require("socketio-auth")(this.io, {
            authenticate(socket: any, data: any, callback: any): any {
                const validTokens: string[] = []
                validTokens.push("Fance")
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

        this.server.listen(port, () => {
            console.log(`chat server started on port ${port}`)
        })

        console.log(port)
        if (port === 80) {
            this.expressApp.use("/", require("redirect-https")({
                body: "<!-- Hello Mr Developer! Please use HTTPS instead -->",
            }))
            // this.startHTTPSServer(this.expressApp)
        }

        // this.app.use(helmet())

    }

    // private startHTTPSServer(server: any): void {
    //     try {
    //         const httpsOptions: any = {
    //             cert: fs.readFileSync("/etc/letsencrypt/live/www.heidelberg-experience.com/cert.pem"),
    //             key: fs.readFileSync("/etc/letsencrypt/live/www.heidelberg-experience.com/privkey.pem"),
    //         }
    //         https.createServer(httpsOptions, server)
    //             .listen(443)
    //         console.log("https listening on port: 443")
    //     } catch (error) {
    //         console.log(error.message)
    //     }
    // }
}

// choose any port number that fits you
const chatServerPort: number = (process.argv[2] === undefined) ?
    Number(process.env.CHAT_SERVER_PORT) : Number(process.argv[2])

const chatServer: ChatServer = new ChatServer(new DefaultChatManager())
chatServer.start(chatServerPort)
