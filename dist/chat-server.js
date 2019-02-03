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
        //
    }
    start(port) {
        this.io.on("connection", (socket) => {
            this.chatManager.handleConnect(socket);
            socket.on("disconnect", () => {
                this.chatManager.handleDisConnect(socket);
            });
            socket.on("message", (message) => {
                this.chatManager.handleMessage(this.io, JSON.parse(message));
            });
        });
        this.http.listen(port, () => {
            console.log(`chat server started on port ${port}`);
        });
    }
}
exports.ChatServer = ChatServer;
const chatServerPort = 3000; // choose any port number that fits you
const chatServer = new ChatServer(new default_chat_manager_1.DefaultChatManager());
chatServer.start(chatServerPort);
