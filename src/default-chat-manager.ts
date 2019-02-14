import { HomoDigitalis } from "homo-digitalis"
import { CurriculaService } from "homo-digitalis-curricula-service"
import { IIntent } from "nlp-trainer"
import { IAnswer, IAnswerExtended } from "nlp-with-actions"
import { IChatAdministrator } from "./chat-server"

export class DefaultChatManager implements IChatAdministrator {
    private readonly authenticatedSocketIDs: string[] = []
    private readonly preparedSocketIDs: string[] = []
    private readonly homoDigitalis: HomoDigitalis = new HomoDigitalis()

    // tslint:disable-next-line:prefer-function-over-method
    public async handleConnect(socket: any): Promise<void> {
        console.log(`user connected ${socket.id}`)
        this.authenticatedSocketIDs.push(socket.id)

        const curriculaService: CurriculaService = new CurriculaService()
        const curriculumContent: IIntent[] = await curriculaService.provideCurriculumByID("exampleMap")
        await this.homoDigitalis.learn(curriculumContent)
    }

    public handleDisConnect(socket: any): void {
        console.log("user disconnected")
    }

    public async handleMessage(socketID: string, io: any, message: any): Promise<void> {
        console.log(socketID)
        if (this.authenticatedSocketIDs.some((authenticatedSocketID: string) => authenticatedSocketID === socketID)) {
            io.emit("message", { type: "message", text: message })
            if (!this.preparedSocketIDs.some((preparedSocketID: string) => preparedSocketID === socketID)) {
                io.emit("message", { type: "message", text: "Yay. Das ist richtig. Ich wünsche Dir viel Spaß." })
                this.preparedSocketIDs.push(socketID)
            }
            const answer: IAnswer = await this.homoDigitalis.answer(message)
            io.emit("message", { type: "message", text: answer.text })
        }
    }
}
