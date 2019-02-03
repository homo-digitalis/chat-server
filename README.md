# Chat Server
As simple as it gets

This chat server makes sure your users can chat in realtime

## Usage Example
    import { ChatServer, DefaultChatManager, IChatManager } from "chat-server"

    // choose a port number that fits you
    const chatServerPort: number = 3000

    // Instead of using the integrated "DefaultChatManager" you can use your own
    const chatManager: IChatManager = new DefaultChatManager()
    const chatServer: ChatServer = new ChatServer(chatManager)

    chatServer.start(chatServerPort)



## Feedback
If you find any issues or want to share improvement proposals in general feel free to open an issue or a pull request [here](https://github.com/homo-digitalis/chat-server).

