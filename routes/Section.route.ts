import express, { Request, Response } from 'express';
import { SectionController } from '../controllers/Section.controller';

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/sections', async (req: Request, res: Response) => {
    const formData = req.body;

    if (!formData.name || !formData.temperature) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const section = await SectionController.createSection(formData);

    res.status(201).json(section.json());
});

app.patch('/sections/:idSection', async (req: Request, res: Response) => {
    const idSection = parseInt(req.params.idSection);
    const formData = req.body;

    if (isNaN(idSection)) {
        return res.status(404).json({ message: 'Invalid idSection!' });
    }

    if (!formData.name && !formData.temperature && !formData.isActive) {
        return res.status(400).json({ message: 'Missing required fields!' });
    }

    const section = await SectionController.getSection(idSection);

    if (!section) {
        return res.status(404).json({ message: 'Section not found!' });
    }

    await SectionController.updateSection(section, formData);
    
    res.status(200).json(section.json());
});

app.delete('/sections/:idSection', async (req: Request, res: Response) => {
    const idSection = parseInt(req.params.idSection);

    if (isNaN(idSection)) {
        return res.status(404).json({ message: 'Invalid idSection!' });
    }

    const section = await SectionController.getSection(idSection);

    if (!section) {
        return res.status(404).json({ message: 'Section not found!' });
    }

    await SectionController.deleteSection(section);

    res.status(200).json(section.json());
});

app.get('/sections/:idSection/messages', async (req: Request, res: Response) => {
    const idSection = parseInt(req.params.idSection);
    if (isNaN(idSection)) {
        return res.status(404).json({ message: 'Invalid idSection!' });
    }

    const section = await SectionController.getSection(idSection);

    if(!section) {
        return res.status(404).json({ message: 'Section not found!' });
    }

    const messages = await SectionController.getMessages(section);

    res.status(200).json(messages);
});

app.get('/sections', async (req: Request, res: Response) => {
    const sections = await SectionController.getSections();

    res.status(200).json(sections);
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});