import express, { Request, Response } from 'express';
import { MessageController } from '../controllers/Message.controller';

const messageController = new MessageController();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/messages', async (req: Request, res: Response) => {
    const formData = req.body;

    if (!formData.type || !formData.content || !formData.idSection) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const message = await messageController.createMessage(formData);

    res.status(201).json(message.json());
});

app.patch('/messages/:idMessage', async (req: Request, res: Response) => {
    const idMessage = parseInt(req.params.idMessage);
    const formData = req.body;

    if (isNaN(idMessage)) {
        return res.status(404).json({ message: 'Invalid idMessage!' });
    }
    
    if(!formData.content && !formData.isAlternativeAnswer && !formData.isActive) {
        return res.status(400).json({ message: 'Missing required fields!' });
    }

    const message = await messageController.getMessage(idMessage);

    if(!message) {
        return res.status(404).json({ message: 'Message not found!' });
    }

    await messageController.updateMessage(message, formData);

    res.status(200).json(message.json());
});

app.delete('/messages/:idMessage', async (req: Request, res: Response) => {
    const idMessage = parseInt(req.params.idMessage);
    if (isNaN(idMessage)) {
        return res.status(404).json({ message: 'Invalid idMessage!' });
    }
    const message = await messageController.getMessage(idMessage);

    if(!message) {
        return res.status(404).json({ message: 'Message not found!' });
    }

    await messageController.deleteMessage(message);

    res.status(200).json(message.json());
});

app.listen(port, () => {
    console.log(`Servidor está rodando em http://localhost:${port}`);
});
