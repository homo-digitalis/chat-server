export interface IChatManager {
    handleConnect(socket: any): void;
    handleDisConnect(socket: any): void;
    handleMessage(io: any, message: any): void;
}
export declare class ChatServer {
    private readonly chatManager;
    private readonly app;
    private readonly http;
    private readonly io;
    constructor(chatManager: IChatManager);
    start(port: number): void;
}
