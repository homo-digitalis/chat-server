import { IChatAdministrator } from "./chat-server";
export declare class DefaultChatManager implements IChatAdministrator {
    private readonly homoDigitalis;
    handleConnect(socket: any, io: any): Promise<void>;
    handleDisConnect(socket: any): void;
    handleMessage(io: any, message: any): Promise<void>;
}
