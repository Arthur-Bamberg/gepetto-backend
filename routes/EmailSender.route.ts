import express, { Request, Response } from 'express';
import { EmailSenderController } from '../controllers/EmailSender.controller';
import { Connector } from '../utils/Connector';

export const EmailSenderRoute = express.Router();

EmailSenderRoute.post('/', async (req: Request, res: Response) => {
    try {
        const formData = req.body;

        if (!formData.email || !formData.name) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if(await EmailSenderController.sendEmail(formData.email, formData.name)) {
            res.status(200).json({ message: 'Email sent successfully!' }); 

        } else {
            res.status(500).json({ message: 'No information returned from email.' });
        }
    } catch (error: any) {
        return res.status(400).json({ message: error.message });

    } finally {
        Connector.closeConnection();
    }
});