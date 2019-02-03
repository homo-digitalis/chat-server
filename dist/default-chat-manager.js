"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DefaultChatManager {
    // tslint:disable-next-line:prefer-function-over-method
    handleConnect(socket) {
        console.log(`user connected ${socket}`);
    }
    handleDisConnect(socket) {
        console.log("user disconnected");
    }
    handleMessage(io, message) {
        io.emit("message", { type: "message", text: message });
    }
}
exports.DefaultChatManager = DefaultChatManager;
