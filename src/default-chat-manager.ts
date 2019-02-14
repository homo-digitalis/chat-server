import { HomoDigitalis } from "homo-digitalis"
import { CurriculaService } from "homo-digitalis-curricula-service"
import { IIntent } from "nlp-trainer"
import { IAnswer, IAnswerExtended } from "nlp-with-actions"
import { IChatAdministrator } from "./chat-server"

export class DefaultChatManager implements IChatAdministrator {
    private readonly homoDigitalis: HomoDigitalis = new HomoDigitalis()

    // tslint:disable-next-line:prefer-function-over-method
    public async handleConnect(socket: any): Promise<void> {
        console.log(`user connected ${socket}`)
        io.emit("message", { type: "message", text: "Yay. Das ist richtig. Ich wünsche Dir viel Spaß." })
        const curriculaService: CurriculaService = new CurriculaService()
        const curriculumContent: IIntent[] = await curriculaService.provideCurriculumByID("exampleMap")
        await this.homoDigitalis.learn(curriculumContent)
    }

    public handleDisConnect(socket: any): void {
        console.log("user disconnected")
    }

    public async handleMessage(io: any, message: any): Promise<void> {
        io.emit("message", { type: "message", text: message })

        const answer: IAnswer = await this.homoDigitalis.answer(message)
        io.emit("message", { type: "message", text: answer.text })
    }

}
