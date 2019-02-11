import { IChatAdministrator } from "./chat-server";
export declare class DefaultChatManager implements IChatAdministrator {
    private homoDigitalis;
    handleConnect(socket: any): Promise<void>;
    handleDisConnect(socket: any): void;
    handleMessage(io: any, message: any): Promise<void>;
}
