import express, { Request, Response } from 'express';
import { MessageController } from '../controllers/Message.controller';
import { authenticateUser } from './Authenticator.route';
import { getSection } from './Section.route';
import { Section } from '../models/Section.class';
import { Connector } from '../utils/Connector';

export const MessageRoute = express.Router();

MessageRoute.post('/', async (req: Request, res: Response) => {
    try {

        const idUser = await authenticateUser(req, res);

        if (typeof idUser != "number") return;

        const formData = req.body;

        if (!formData.content || !formData.idSection) {
            return res.status(400).json({ message: {
                en: 'Missing required fields',
                pt: 'Campos obrigatórios faltando!'
            } });
        }

        const section = await getSection(res, formData.idSection, idUser);

        if(!(section instanceof Section)) return;

        const message = await MessageController.createMessage(formData);

        if(message) {
            res.status(201).json(message.json());
        }

    } catch(error: any) {
        return res.status(400).json({ message: error.message });

    }
});

MessageRoute.patch('/:guidMessage', async (req: Request, res: Response) => {
    try {
        const idUser = await authenticateUser(req, res);

        if (typeof idUser != "number") return;

        const guidMessage = req.params.guidMessage;
        const formData = req.body;

        if (guidMessage.length != 36) {
            return res.status(404).json({ message: {
                en: 'Invalid guidMessage!',
                pt: 'Identificador de mensagem inválido!'
            } });
        }

        if (!formData.content && !formData.isAlternativeAnswer && !formData.isActive) {
            return res.status(400).json({ message: {
                en: 'Missing required fields',
                pt: 'Campos obrigatórios faltando!'
            } });
        }

        const message = await MessageController.getMessage(guidMessage);

        if (!message) {
            return res.status(404).json({ message: {
                en: 'Message not found!',
                pt: 'Mensagem não encontrada!'
            } });
        }

        const section = await getSection(res, message.FK_idSection ?? 0, idUser);

        if(!(section instanceof Section)) return;

        await MessageController.updateMessage(message, formData);

        res.status(200).json(message.json());

    } catch(error: any) {
        return res.status(400).json({ message: error.message });

    } finally {
        Connector.closeConnection();
    }
});

MessageRoute.delete('/:guidMessage', async (req: Request, res: Response) => {
    try {
        const idUser = await authenticateUser(req, res);

        if (typeof idUser != "number") return;

        const guidMessage = req.params.guidMessage;
        if (guidMessage.length != 36) {
            return res.status(404).json({ message: {
                en: 'Invalid guidMessage!',
                pt: 'Identificador de mensagem inválido!'
            } });
        }
        const message = await MessageController.getMessage(guidMessage);

        if (!message) {
            return res.status(404).json({ message: {
                en: 'Message not found!',
                pt: 'Mensagem não encontrada!'
            } });
        }

        const section = await getSection(res, message.FK_idSection ?? 0, idUser);

        if(!(section instanceof Section)) return;

        await MessageController.deleteMessage(message);

        res.status(200).json(message.json());
        
    } catch(error: any) {
        return res.status(400).json({ message: error.message });

    } finally {
        Connector.closeConnection();
    }
});