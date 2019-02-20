import { CurriculaService } from "@homo-digitalis/curricula"
import * as fs from "fs"
import { HomoDigitalis } from "homo-digitalis"
import { IIntent } from "nlp-trainer"
import { IAnswer } from "nlp-with-actions"
import * as path from "path"
import { IChatAdministrator, IChatbotInfo } from "./chat-server"

export interface IAuthenticatedSocketID {
    socketID: string,
    room: string
}

export class DefaultChatAdministrator implements IChatAdministrator {
    private readonly authenticatedSocketIDs: IAuthenticatedSocketID[] = []
    private readonly preparedSocketIDs: string[] = []
    private readonly homoDigitalis: HomoDigitalis = new HomoDigitalis()
    private readonly curriculaService: CurriculaService = new CurriculaService()

    // tslint:disable-next-line:prefer-function-over-method
    public async handleConnect(socket: any): Promise<void> {
        const authenticatedSocketID: IAuthenticatedSocketID = {
            room: "room",
            socketID: socket.id,
        }
        this.authenticatedSocketIDs.push(authenticatedSocketID)

    }

    public handleDisConnect(socket: any): void {
        console.log(`user disconnected: ${socket.id}`)
    }

    public async handleMessage(socketID: string, io: any, message: any, room: string): Promise<void> {
        const isSocketIDAuthenticated: boolean =
            this.authenticatedSocketIDs.some((authenticatedSocketID: IAuthenticatedSocketID) =>
                authenticatedSocketID.socketID === socketID,
            )

        if (isSocketIDAuthenticated) {
            io.to(room)
                .emit("message", { type: "message", text: message })
            if (!this.preparedSocketIDs.some((preparedSocketID: string) => preparedSocketID === socketID)) {
                this.preparedSocketIDs.push(socketID)
            }
            const answer: IAnswer = await this.homoDigitalis.answer(message)
            if (answer.text === undefined) {
                const defaultText: string =
                    // tslint:disable-next-line:max-line-length
                    `Bitte klicke auf das Graduierungshütchen und bringe mir bei wie ich auf "${message}" antworten soll.`
                io.to(room)
                    .emit("message", { type: "botMessage", text: defaultText })
            } else {
                io.to(room)
                    .emit("message", { type: "botMessage", text: answer.text })
            }
        }
    }

    public async handleGetTrainingData(socketID: string, io: any, chatBotName: any): Promise<void> {
        console.log(chatBotName)
        const intents: IIntent[] = this.getIntents(chatBotName)
        io.to(chatBotName)
            .emit("trainingdata", intents)

        await this.homoDigitalis.learn(intents)
    }

    public async handleTrainingData(chatBotName: string, intents: IIntent[]): Promise<void> {
        console.log(chatBotName)
        this.saveIntents(chatBotName, intents)
        await this.homoDigitalis.learn(intents)
    }

    private getIntents(chatBotName: string): IIntent[] {

        let chatBotInfo: IChatbotInfo

        try {
            chatBotInfo =
                JSON.parse(fs.readFileSync(path.join(__dirname, `../training-data/${chatBotName}.json`))
                    .toString("utf8"))
        } catch (error) {
            chatBotInfo =
                JSON.parse(fs.readFileSync(path.join(__dirname, "../training-data/fancy.json"))
                    .toString("utf8"))

        }

        return chatBotInfo.intents
    }

    private saveIntents(chatBotName: string, intents: IIntent[]): void {

        fs.writeFileSync(path.join(__dirname, `../training-data/${chatBotName}.json`), JSON.stringify(intents))
    }

}
