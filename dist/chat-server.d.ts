export interface IChatAdministrator {
    handleConnect(socket: any): void;
    handleDisConnect(socket: any): void;
    handleMessage(io: any, message: any): void;
}
export declare class ChatServer {
    private readonly administrator;
    private readonly app;
    private readonly http;
    private readonly io;
    constructor(administrator: IChatAdministrator);
    start(port: number): void;
    private startHTTPSServer(server);
}
