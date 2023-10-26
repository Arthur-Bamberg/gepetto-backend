import express, { Request, Response } from 'express';
import { Connector } from '../utils/Connector';
import { SectionController } from '../controllers/Section.controller';
import { authenticateUser } from './Authenticator.route';
import { Section } from '../models/Section.class';

export const SectionRoute = express.Router();

SectionRoute.post('/', async (req: Request, res: Response) => {
    try {
        const idUser = await authenticateUser(req, res);

        if (typeof idUser != "number") return;

        const formData = req.body;

        if (!formData.name || formData.name.trim() == '') {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const section = await SectionController.createSection(formData, idUser);

        res.status(201).json(section.json());

    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
});

SectionRoute.patch('/:idSection', async (req: Request, res: Response) => {
    try {

        const idUser = await authenticateUser(req, res);

        if (typeof idUser != "number") return;

        const idSection = parseInt(req.params.idSection);
        const formData = req.body;

        if (isNaN(idSection)) {
            return res.status(404).json({ message: 'Invalid idSection!' });
        }

        if ((!formData.name || formData.name.trim() == '') && !formData.isActive) {
            return res.status(400).json({ message: 'Missing required fields!' });
        }

        const section = await getSection(res, idSection, idUser);

        if (!(section instanceof Section)) return;

        await SectionController.updateSection(section, formData);

        res.status(200).json(section.json());

    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
});

SectionRoute.delete('/:idSection', async (req: Request, res: Response) => {
    try {
        const idUser = await authenticateUser(req, res);

        if (typeof idUser != "number") return;

        const idSection = parseInt(req.params.idSection);

        if (isNaN(idSection)) {
            return res.status(404).json({ message: 'Invalid idSection!' });
        }

        const section = await getSection(res, idSection, idUser);

        if (!(section instanceof Section)) return;

        await SectionController.deleteSection(section, idUser);

        res.status(200).json(section.json());

    } catch (error: any) {
        return res.status(400).json({ message: error.message });

    }
});

SectionRoute.get('/:idSection/messages', async (req: Request, res: Response) => {
    try {
        const idUser = await authenticateUser(req, res);

        if (typeof idUser != "number") return;

        const idSection = parseInt(req.params.idSection);
        if (isNaN(idSection)) {
            return res.status(404).json({ message: 'Invalid idSection!' });
        }

        const section = await getSection(res, idSection, idUser);

        if (!(section instanceof Section)) return;

        const messages = await SectionController.getMessages(section);

        res.status(200).json(messages);

    } catch (error: any) {
        return res.status(400).json({ message: error.message });

    }
});

SectionRoute.get('/', async (req: Request, res: Response) => {
    try {
        const idUser = await authenticateUser(req, res);

        if (typeof idUser != "number") return;

        const sections = await SectionController.getSections(idUser);

        res.status(200).json(sections);
    } catch (error: any) {
        return res.status(400).json({ message: error.message });

    }
});

export const getSection = async (res: Response, idSection: number, idUser: number) => {
    const section = await SectionController.getSection(idSection, idUser);

    if (!section) {
        return res.status(404).json({ message: 'Section not found!' });
    }

    return section;
}