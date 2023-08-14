import { Message } from "../models/Message.class";

export class MessageController {
    public async createMessage(formData: any): Promise<Message> {
        const message = new Message(formData.content, formData.type, formData.idSection, formData.isAlternativeAnswer ?? 0, formData.isActive ?? 1);
        await message.save();
        return message;
    }

    public async deleteMessage(idMessage: number): Promise<Message> {
        const message = await Message.getById(idMessage);
        if (!message) {
            throw new Error('Message not found');
        }

        await message.delete();

        return message;
    }
}