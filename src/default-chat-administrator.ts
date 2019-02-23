import * as fs from "fs"
import { HomoDigitalis } from "homo-digitalis"
import { IIntent } from "nlp-trainer"
import { IAnswer } from "nlp-with-actions"
import * as path from "path"
import { IChatAdministrator, IChatBotInfo } from "./chat-server"

export interface IAuthenticatedSocketID {
    socketID: string,
    room: string
}

export interface IRespHD {
    chatBotName: string,
    homoDigitalis: HomoDigitalis
}

export class DefaultChatAdministrator implements IChatAdministrator {

    private static readonly trainingDataFolder: string = path.join(__dirname, "../training-data")
    public static async getInstance(): Promise<DefaultChatAdministrator> {
        return new DefaultChatAdministrator(await DefaultChatAdministrator.getAllResponsibleHDs())
    }

    public static async getAllResponsibleHDs(): Promise<IRespHD[]> {
        const allRespHDs: IRespHD[] = []
        fs.readdirSync(DefaultChatAdministrator.trainingDataFolder)
            .forEach(async (file: string) => {
                const respHD: IRespHD = {
                    chatBotName: file,
                    homoDigitalis: new HomoDigitalis(),
                }

                await respHD.homoDigitalis.learn(DefaultChatAdministrator.getChatBotInfo(file).intents)
                allRespHDs.push(respHD)
            })

        return allRespHDs
    }

    private static getChatBotInfo(chatBotName: string): IChatBotInfo {

        let chatBotInfo: IChatBotInfo

        try {
            chatBotInfo =
                JSON.parse(fs.readFileSync(`${DefaultChatAdministrator.trainingDataFolder}/${chatBotName}.json`)
                    .toString("utf8"))
        } catch (error) {
            chatBotInfo =
                JSON.parse(fs.readFileSync(`${DefaultChatAdministrator.trainingDataFolder}/fancy.json`)
                    .toString("utf8"))

        }

        return chatBotInfo
    }

    private readonly authenticatedSocketIDs: IAuthenticatedSocketID[] = []
    private readonly preparedSocketIDs: string[] = []
    private readonly respHDs: IRespHD[] = []

    // tslint:disable-next-line:unnecessary-constructor
    private constructor(respHDs: IRespHD[]) {
        this.respHDs = respHDs
    }

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

    public async getAnswer(message: string, room: string): Promise<IAnswer> {
        const homoDigitalis: HomoDigitalis =
            this.respHDs.filter((responsible: IRespHD) => responsible.chatBotName === room)[0].homoDigitalis
        if (homoDigitalis === undefined) {
            throw new Error("Somebody wanted to get an answer by an undefined Homo Digitalis")
        }

        const answer: IAnswer =
            await homoDigitalis.answer(message)
        if (answer.text === undefined) {
            answer.text =
                `Bitte klicke auf das Graduierungshütchen und bringe mir bei wie ich auf "${message}" antworten soll.`
        }

        return answer
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
            const answer: IAnswer = await this.getAnswer(message, room)
            io.to(room)
                .emit("message", { type: "botMessage", text: answer.text })

        }
    }

    public async handleGetTrainingData(socketID: string, io: any, chatBotName: any): Promise<void> {
        const chatBotInfo: IChatBotInfo = DefaultChatAdministrator.getChatBotInfo(chatBotName)
        io.to(chatBotName)
            .emit("trainingdata", chatBotInfo)

        let respHD: IRespHD =
            this.respHDs.filter((responsible: IRespHD) => responsible.chatBotName === chatBotName)[0]

        if (respHD === undefined) {
            await this.saveChatBotInfo({
                authorizationQuestion: "string",
                intents: [],
                limitedUsage: false,
                name: chatBotName,
            })
            respHD = this.respHDs.filter((responsible: IRespHD) => responsible.chatBotName === chatBotName)[0]
        }

        const homoDigitalis: HomoDigitalis = respHD.homoDigitalis
        if (homoDigitalis === undefined) {
            throw new Error("Somebody wanted to train an undefined Homo Digitalis")
        } else {
            await homoDigitalis.learn(chatBotInfo.intents)
        }

    }

    public async saveChatBotInfo(chatBotInfo: IChatBotInfo): Promise<void> {
        let respHD: IRespHD =
            this.respHDs.filter((responsible: IRespHD) => responsible.chatBotName === chatBotInfo.name)[0]
        if (respHD === undefined) {

            this.respHDs.push({
                chatBotName: chatBotInfo.name,
                homoDigitalis: new HomoDigitalis(),
            })

            chatBotInfo.intents = DefaultChatAdministrator.getChatBotInfo("fancy").intents

            respHD = this.respHDs[this.respHDs.length - 1]
        }

        fs.writeFileSync(
            `${DefaultChatAdministrator.trainingDataFolder}/${chatBotInfo.name}.json`, JSON.stringify(chatBotInfo))

        console.log(respHD.chatBotName)
        await respHD.homoDigitalis.learn(chatBotInfo.intents)

    }

}
