import { CurriculaService } from "@homo-digitalis/curricula"
import { HomoDigitalis } from "homo-digitalis"
import { IIntent } from "nlp-trainer"
import { IAnswer } from "nlp-with-actions"
import { IChatAdministrator } from "./chat-server"

export class DefaultChatManager implements IChatAdministrator {
    private readonly authenticatedSocketIDs: string[] = []
    private readonly preparedSocketIDs: string[] = []
    private readonly homoDigitalis: HomoDigitalis = new HomoDigitalis()
    private readonly curriculaService: CurriculaService = new CurriculaService()

    // tslint:disable-next-line:prefer-function-over-method
    public async handleConnect(socket: any): Promise<void> {
        console.log(`user connected ${socket.id}`)
        this.authenticatedSocketIDs.push(socket.id)

        const curriculumContent: IIntent[] =
            await this.curriculaService.provideCurriculumByID("exampleMap")

        await this.homoDigitalis.learn(curriculumContent)
    }

    public handleDisConnect(socket: any): void {
        console.log(`user disconnected: ${socket.id}`)
    }

    public async handleMessage(socketID: string, io: any, message: any): Promise<void> {
        console.log(socketID)
        if (this.authenticatedSocketIDs.some((authenticatedSocketID: string) => authenticatedSocketID === socketID)) {
            io.emit("message", { type: "message", text: message })
            if (!this.preparedSocketIDs.some((preparedSocketID: string) => preparedSocketID === socketID)) {
                this.preparedSocketIDs.push(socketID)
            }
            const answer: IAnswer = await this.homoDigitalis.answer(message)
            io.emit("message", { type: "message", text: answer.text })
        }
    }

    public async handleTrainingData(chatBotName: string, trainingData: any): Promise<void> {
        console.log(`TrainingData received: ${JSON.stringify(trainingData)}`)
        await this.curriculaService.saveCurriculumByID(chatBotName, trainingData)
        const curriculumContent: IIntent[] = await this.curriculaService.provideCurriculumByID(chatBotName)
        await this.homoDigitalis.learn(curriculumContent)
    }

}
