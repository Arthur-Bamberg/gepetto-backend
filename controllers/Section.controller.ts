import { Section } from "../models/Section.class";

export class SectionController {
    public static async createSection(formData: any, idUser: number): Promise<Section> {
        const section = new Section(formData.name, formData.temperature, formData.isActive ?? 1);
        await section.save();
        section.addToUser(idUser);
        return section;
    }

    public static async updateSection(section: Section, formData: any): Promise<void> {
        if(formData.name) {
            section.name = formData.name;
        }

        if(formData.temperature) {
            section.temperature = formData.temperature;
        }

        if(formData.isActive) {
            section.isActive = formData.isActive;
        }

        await section.update();
    }

    public static async deleteSection(section: Section, idUser: number): Promise<void> {
        await section.delete();
        section.removeFromUser(idUser);
    }

    public static async getSection(idSection: number, idUser: number): Promise<Section | null> {
        return await Section.getById(idSection, idUser);
    }

    public static async getMessages(section: Section): Promise<any[]> {
        return await section.getMessages() ?? [];
    }

    public static async getSections(idUser: number): Promise<any[] | []> {
        return await Section.getAll(idUser) ?? [];    
    }
}