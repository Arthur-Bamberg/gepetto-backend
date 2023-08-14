import express, { Request, Response } from 'express';
import { SectionController } from '../controllers/Section.controller';

const app = express();
const port = 3000;

const sectionController = new SectionController();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/sections', async (req: Request, res: Response) => {
    const formData = req.body;

    if (!formData.name || !formData.temperature) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const section = await sectionController.createSection(formData);

    res.status(201).json(section.json());
});

app.get('/sections/:idSection/messages', (req: Request, res: Response) => {
    const message = parseInt(req.params.idSection);
    if (isNaN(message)) {
        return res.status(404).json({ message: 'Message not found' });
    }
    res.json(message);
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});