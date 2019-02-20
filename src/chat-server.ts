import { ConfigurationReader } from "configuration-reader"
import * as express from "express"
import * as fs from "fs"
import * as helmet from "helmet"
import * as http from "http"
import * as https from "https"
import { HTTPSProvider } from "https-provider"
import { IIntent } from "nlp-trainer"
import * as path from "path"
import { DefaultChatAdministrator } from "./default-chat-administrator"

export interface IChatAdministrator {
    handleConnect(socket: any): void
    handleDisConnect(socket: any): void
    handleMessage(socketID: string, io: any, message: any, room: string): void
    handleTrainingData(chatbotName: string, intents: IIntent[]): void
    handleGetTrainingData(socketID: string, io: any, chatbotName: string): void
}

export interface IChatbotInfo {
    limitedUsage: boolean
    authorizationQuestion: string
    intents: IIntent[]
}

export enum events {
    connect = "connect",
    disconnect = "disconnect",
    message = "message",
    provideChatBotInfo = "provideChatBotInfo",
    saveChatBotInfo = "saveChatBotInfo",
    join = "join",
}

export interface IMessage {
    text: string
    fromChatBot: boolean
}

export class ChatServer {

    private static configurationReader: ConfigurationReader
    private readonly expressApp: any = express()
    private readonly options: any
    private readonly server: any
    private readonly io: any

    public constructor(private readonly administrator: IChatAdministrator) {
        ChatServer.configurationReader = new ConfigurationReader(path.join(__dirname, "../.env"))
        console.log(process.env.NODE_ENV)
        if (process.env.NODE_ENV === "production") {
            console.log("starting https")
            this.options = new HTTPSProvider("angular-server-certificate").provideHTTPSOptions()
            this.server = https.createServer(this.options, this.expressApp)
        } else {
            console.log("starting http")
            this.server = http.createServer(this.expressApp)
        }

        this.io = require("socket.io")(this.server)

        require("socketio-auth")(this.io, {
            authenticate(socket: any, data: any, callback: any): any {
                const validTokens: string[] = []
                validTokens.push(ChatServer.configurationReader.get("keyword"))
                if (validTokens.some((token: string) => token === data.token.toLowerCase())) {
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

            socket.on("message", (message: any, room: string) => {
                this.administrator.handleMessage(socket.id, this.io, JSON.parse(message), room)
            })

            socket.on("trainingdata", (room: string) => {
                this.administrator.handleGetTrainingData(socket.id, this.io, room)
            })

            socket.on("train", (data: any) => {
                this.administrator.handleTrainingData(data.chatBotName, data.intents)
            })

            socket.on("join", (room: string) => {
                console.log(`joining room ${room}`)
                socket.join(room)
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
        }

        // this.app.use(helmet())

    }
}

// choose any port number that fits you
// const chatServerPort: number = 8443
const chatServerPort: number = 3000

const chatServer: ChatServer = new ChatServer(new DefaultChatAdministrator())
chatServer.start(chatServerPort)
