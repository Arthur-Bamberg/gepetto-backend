import express, { Request, Response } from 'express';
import { MessageController } from '../controllers/Message.controller';
import { authenticateUser } from './Authenticator.route';
import { getSection } from './Section.route';
import { Section } from '../models/Section.class';

export const MessageRoute = express.Router();

MessageRoute.post('/', async (req: Request, res: Response) => {
    const idUser = await authenticateUser(req, res);

    if (typeof idUser != "number") return;

    const formData = req.body;

    if (!formData.type || !formData.content || !formData.idSection) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const section = await getSection(res, formData.idSection, idUser);

    if(!(section instanceof Section)) return;

    const message = await MessageController.createMessage(formData);

    res.status(201).json(message.json());
});

MessageRoute.patch('/:idMessage', async (req: Request, res: Response) => {
    const idUser = await authenticateUser(req, res);

    if (typeof idUser != "number") return;

    const idMessage = parseInt(req.params.idMessage);
    const formData = req.body;

    if (isNaN(idMessage)) {
        return res.status(404).json({ message: 'Invalid idMessage!' });
    }

    if (!formData.content && !formData.isAlternativeAnswer && !formData.isActive) {
        return res.status(400).json({ message: 'Missing required fields!' });
    }

    const message = await MessageController.getMessage(idMessage);

    if (!message) {
        return res.status(404).json({ message: 'Message not found!' });
    }

    const section = await getSection(res, message.FK_idSection ?? 0, idUser);

    if(!(section instanceof Section)) return;

    await MessageController.updateMessage(message, formData);

    res.status(200).json(message.json());
});

MessageRoute.delete('/:idMessage', async (req: Request, res: Response) => {
    const idUser = await authenticateUser(req, res);

    if (typeof idUser != "number") return;

    const idMessage = parseInt(req.params.idMessage);
    if (isNaN(idMessage)) {
        return res.status(404).json({ message: 'Invalid idMessage!' });
    }
    const message = await MessageController.getMessage(idMessage);

    if (!message) {
        return res.status(404).json({ message: 'Message not found!' });
    }

    const section = await getSection(res, message.FK_idSection ?? 0, idUser);

    if(!(section instanceof Section)) return;

    await MessageController.deleteMessage(message);

    res.status(200).json(message.json());
});