export interface IChatAdministrator {
    handleConnect(socket: any, io: any): void;
    handleDisConnect(socket: any): void;
    handleMessage(io: any, message: any): void;
}
export declare class ChatServer {
    private readonly administrator;
    private readonly expressApp;
    private readonly options;
    private readonly server;
    private readonly io;
    constructor(administrator: IChatAdministrator);
    start(port: number): void;
}
