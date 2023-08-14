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

app.delete('/messages/:idMessage', async (req: Request, res: Response) => {
    const idMessage = parseInt(req.params.idMessage);
    if (isNaN(idMessage)) {
        return res.status(404).json({ message: 'Message not found' });
    }
    await messageController.deleteMessage(idMessage);
    res.status(204).end();
});

app.listen(port, () => {
    console.log(`Servidor está rodando em http://localhost:${port}`);
});
