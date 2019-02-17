import { CurriculaService } from "@homo-digitalis/curricula"
import { HomoDigitalis } from "homo-digitalis"
import { IIntent } from "nlp-trainer"
import { IAnswer } from "nlp-with-actions"
import { IChatAdministrator } from "./chat-server"

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

        const curriculumContent: IIntent[] =
            await this.curriculaService.provideCurriculumByID("exampleMap")

        await this.homoDigitalis.learn(curriculumContent)
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
            io.to(room)
                .emit("message", { type: "message", text: answer.text })
        }
    }

    public async handleGetTrainingData(socketID: string, io: any, chatBotName: any): Promise<void> {
        console.log(chatBotName)
        io.to(chatBotName)
            .emit("trainingdata", this.getIntents())
    }

    public async handleTrainingData(chatBotName: string, trainingData: any): Promise<void> {
        await this.curriculaService.saveCurriculumByID(chatBotName, trainingData)
        const curriculumContent: IIntent[] = await this.curriculaService.provideCurriculumByID(chatBotName)
        await this.homoDigitalis.learn(curriculumContent)
    }

    private getIntents(): IIntent[] {
        return [
            {
                answers: [
                    {
                        actions: ["thumbs up", "thumbs down"],
                        text: "Bye. I hope to see you soon Michelski.",
                    },
                    {
                        actions: [],
                        text: "see you soon!",
                    }],
                language: "en",
                name: "greetings.bye",
                utterances: ["cu", "bye"],
            },
            {
                answers: [
                    {
                        actions: ["thumbs up", "thumbs down"],
                        text: "Hey. I'm glad your here.",
                    }],
                language: "en",
                name: "greetings.hello",
                utterances: ["hello", "hi", "hey"],
            },
        ]
    }

}
