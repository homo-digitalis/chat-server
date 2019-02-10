"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const default_chat_manager_1 = require("./default-chat-manager");
class ChatServer {
    // tslint:disable-next-line:unnecessary-constructor
    constructor(chatManager) {
        this.chatManager = chatManager;
        this.app = require("express")();
        this.http = require("http")
            .Server(this.app);
        this.io = require("socket.io")(this.http);
    }
    start(port) {
        this.io.on("connection", (socket) => {
            console.log("michael");
            // socket.emit("authentication", { token: "4712" })
            // socket.on("authenticated", () => {
            // use the socket as usual
            this.chatManager.handleConnect(socket);
            socket.on("disconnect", () => {
                this.chatManager.handleDisConnect(socket);
            });
            socket.on("message", (message) => {
                this.chatManager.handleMessage(this.io, JSON.parse(message));
            });
            //            })
        });
        this.http.listen(port, () => {
            console.log(`chat server started on port ${port}`);
        });
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
exports.ChatServer = ChatServer;
console.log(process.argv[2]);
// choose any port number that fits you
const chatServerPort = (process.argv[2] === undefined) ?
    3005 :
    Number(process.argv[2]);
const chatServer = new ChatServer(new default_chat_manager_1.DefaultChatManager());
chatServer.start(chatServerPort);
