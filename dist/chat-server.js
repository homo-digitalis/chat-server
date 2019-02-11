"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const default_chat_manager_1 = require("./default-chat-manager");
class ChatServer {
    constructor(administrator) {
        this.administrator = administrator;
        this.app = require("express")();
        this.http = require("http")
            .Server(this.app);
        this.io = require("socket.io")(this.http);
        require("socketio-auth")(this.io, {
            authenticate(socket, data, callback) {
                const validTokens = [];
                validTokens.push("4712");
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
            this.administrator.handleConnect(socket);
            socket.on("disconnect", () => {
                this.administrator.handleDisConnect(socket);
            });
            socket.on("message", (message) => {
                this.administrator.handleMessage(this.io, JSON.parse(message));
            });
        });
        this.http.listen(port, () => {
            console.log(`chat server started on port ${port}`);
        });
    }
}
exports.ChatServer = ChatServer;
// choose any port number that fits you
const chatServerPort = Number(process.argv[2]);
const chatServer = new ChatServer(new default_chat_manager_1.DefaultChatManager());
chatServer.start(chatServerPort);
