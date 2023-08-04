import { Section } from "../models/Section.class";

export class SectionController {
    // createSection(

    // ): Promise<Section> {

    // }

    async getSections(): Promise<Section[] | null> {
        return await Section.getAll();
    }
}