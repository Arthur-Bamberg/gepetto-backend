import { Message, Type } from "../models/Message.class";

export class MessageController {
    public static async createMessage(formData: any): Promise<Message| void> {
        const message = new Message(formData.content, Type.PROMPT, formData.idSection, formData.isAlternativeAnswer ?? 0);
        const answer = message.saveAndGetAnswer();

        return answer;
    }

    public static async getMessage(guidMessage: string): Promise<Message | null> {
        return await Message.getByGuid(guidMessage);
    }

    public static async updateMessage(message: Message, formData: any): Promise<void> {
        if(formData.content) {
            message.content = formData.content;
        } 

        if(formData.isAlternativeAnswer) {
            message.isAlternativeAnswer = formData.isAlternativeAnswer;
        }

        if(formData.isActive) {
            message.isActive = formData.isActive;
        }

        await message.update();
    }

    public static async deleteMessage(message: Message): Promise<void> {
        await message.delete();
    }
}