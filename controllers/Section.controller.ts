import { Message } from "../models/Message.class";
import { Section } from "../models/Section.class";

export class SectionController {
    async createSection(formData: any): Promise<Section> {
        const section = new Section(formData.name, formData.temperature, formData.isActive ?? 1);
        await section.save();
        return section;
    }

    async getMessages(idSection: number): Promise<Message[] | null> {
        const section = await Section.getById(idSection);
        if (!section) {
            return null;
        }
        return await section.getMessages();
    }

    async getSections(): Promise<Section[] | null> {
        return await Section.getAll();
    }
}