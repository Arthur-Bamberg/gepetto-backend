import { Section } from "../models/Section.class";

export class SectionController {
    async createSection(formData: any): Promise<Section> {
        const section = new Section(formData.name, formData.temperature, formData.isActive ?? 1);
        await section.save();
        return section;
    }

    async updateSection(section: Section, formData: any): Promise<void> {
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

    async deleteSection(section: Section): Promise<void> {
        await section.delete();
    }

    async getSection(idSection: number): Promise<Section | null> {
        return await Section.getById(idSection);
    }

    async getMessages(section: Section): Promise<any[]> {
        return await section.getMessages() ?? [];
    }

    async getSections(): Promise<any[] | []> {
        return await Section.getAll() ?? [];    
    }
}