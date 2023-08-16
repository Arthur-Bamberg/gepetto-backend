import { Message } from "../models/Message.class";

export class MessageController {
    public static async createMessage(formData: any): Promise<Message> {
        const message = new Message(formData.content, formData.type, formData.idSection, formData.isAlternativeAnswer ?? 0, formData.isActive ?? 1);
        await message.save();
        return message;
    }

    public static async getMessage(idMessage: number): Promise<Message | null> {
        return await Message.getById(idMessage);
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