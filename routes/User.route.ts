import express, { Request, Response } from 'express';
import { UserController } from '../controllers/User.controller';

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/users', async (req: Request, res: Response) => {
    const formData = req.body;

    if (!formData.name || !formData.email || !formData.password) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await UserController.createUser(formData);

    res.status(201).json(user.json());
});

app.patch('/users/:idUser', async (req: Request, res: Response) => {
    const idUser = parseInt(req.params.idUser);
    const formData = req.body;

    if (isNaN(idUser)) {
        return res.status(404).json({ message: 'Invalid idUser!' });
    }

    if (!formData.name && !formData.email && !formData.password && !formData.isActive) {
        return res.status(400).json({ message: 'Missing required fields!' });
    }

    const user = await UserController.getUser(idUser);

    if (!user) {
        return res.status(404).json({ message: 'User not found!' });
    }

    await UserController.updateUser(user, formData);
    
    res.status(200).json(user.json());
});

app.delete('/users/:idUser', async (req: Request, res: Response) => {
    const idUser = parseInt(req.params.idUser);

    if (isNaN(idUser)) {
        return res.status(404).json({ message: 'Invalid idUser!' });
    }

    const user = await UserController.getUser(idUser);

    if (!user) {
        return res.status(404).json({ message: 'user not found!' });
    }

    await UserController.deleteUser(user);

    res.status(200).json(user.json());
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});