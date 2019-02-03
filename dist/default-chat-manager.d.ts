import { IChatManager } from "./chat-server";
export declare class DefaultChatManager implements IChatManager {
    handleConnect(socket: any): void;
    handleDisConnect(socket: any): void;
    handleMessage(io: any, message: any): void;
}
