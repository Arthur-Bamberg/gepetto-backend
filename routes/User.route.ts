import express, { Request, Response } from 'express';
import { UserController } from '../controllers/User.controller';
import { authenticateUser } from './Authenticator.route';

export const UserRoute = express.Router();

UserRoute.post('/', async (req: Request, res: Response) => {
    const formData = req.body;

    if (!formData.name || !formData.email || !formData.password) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    if(!await UserController.emailIsUnique(formData.email)) {
        return res.status(400).json({ message: 'Email already registered' });
    }

    const token = await UserController.createUser(formData);

    res.status(201).json({token});
});

UserRoute.patch('/', async (req: Request, res: Response) => {
    const idUser = await authenticateUser(req, res);

    if (typeof idUser != "number") return;
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

    if(formData.email && formData.email != user.email && !await UserController.emailIsUnique(formData.email)) {
        return res.status(400).json({ message: 'Email already registered!' });
    }

    const token = await UserController.updateUser(user, formData);

    res.status(200).json({token});
});

UserRoute.delete('/', async (req: Request, res: Response) => {
    const idUser = await authenticateUser(req, res);

    if (typeof idUser != "number") return;

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