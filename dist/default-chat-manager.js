"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const homo_digitalis_1 = require("homo-digitalis");
const homo_digitalis_curricula_service_1 = require("homo-digitalis-curricula-service");
class DefaultChatManager {
    constructor() {
        this.homoDigitalis = new homo_digitalis_1.HomoDigitalis();
    }
    // tslint:disable-next-line:prefer-function-over-method
    async handleConnect(socket) {
        console.log(`user connected ${socket}`);
        const curriculaService = new homo_digitalis_curricula_service_1.CurriculaService();
        const curriculumContent = await curriculaService.provideCurriculumByID("exampleMap");
        await this.homoDigitalis.learn(curriculumContent);
    }
    handleDisConnect(socket) {
        console.log("user disconnected");
    }
    async handleMessage(io, message) {
        io.emit("message", { type: "message", text: message });
        const answer = await this.homoDigitalis.answer("hi");
        io.emit("message", { type: "message", text: answer.text });
    }
}
exports.DefaultChatManager = DefaultChatManager;
