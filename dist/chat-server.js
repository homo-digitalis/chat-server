"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const https = require("https");
const https_provider_1 = require("https-provider");
const default_chat_manager_1 = require("./default-chat-manager");
class ChatServer {
    constructor(administrator) {
        this.administrator = administrator;
        // private readonly http: any = require("http")
        //     .Server(this.expressApp)
        // private readonly https: any = require("https")
        //     .Server(this.expressApp)
        // private readonly io: any = require("socket.io")(this.https)
        this.expressApp = express();
        console.log(process.env.NODE_ENV);
        if (process.env.NODE_ENV === "production") {
            console.log("starting https");
            this.options = new https_provider_1.HTTPSProvider("chat-server-certificate").provideHTTPSOptions();
            this.server = https.createServer(this.options, this.expressApp);
        }
        else {
            console.log("starting http");
            this.server = http.createServer(this.expressApp);
        }
        this.io = require("socket.io")(this.server);
        require("socketio-auth")(this.io, {
            authenticate(socket, data, callback) {
                const validTokens = [];
                validTokens.push("Fance");
                if (validTokens.some((token) => token === data.token)) {
                    // tslint:disable-next-line:no-null-keyword
                    return callback(null, socket.id);
                }
                else {
                    socket.emit("authenticationFailed");
                }
                return callback(new Error("User not found"));
            },
        });
    }
    start(port) {
        this.io.on("connection", (socket) => {
            this.administrator.handleConnect(socket, this.io);
            socket.on("disconnect", () => {
                this.administrator.handleDisConnect(socket);
            });
            socket.on("message", (message) => {
                this.administrator.handleMessage(this.io, JSON.parse(message));
            });
        });
        this.server.listen(port, () => {
            console.log(`chat server started on port ${port}`);
        });
        console.log(port);
        if (port === 80) {
            this.expressApp.use("/", require("redirect-https")({
                body: "<!-- Hello Mr Developer! Please use HTTPS instead -->",
            }));
            // this.startHTTPSServer(this.expressApp)
        }
        // this.app.use(helmet())
    }
}
exports.ChatServer = ChatServer;
// choose any port number that fits you
const chatServerPort = (process.argv[2] === undefined) ?
    Number(process.env.CHAT_SERVER_PORT) : Number(process.argv[2]);
const chatServer = new ChatServer(new default_chat_manager_1.DefaultChatManager());
chatServer.start(chatServerPort);
