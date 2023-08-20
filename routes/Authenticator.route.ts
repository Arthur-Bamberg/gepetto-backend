import express, { Request, Response } from 'express';
import { AuthenticatorController } from '../controllers/Authenticator.controller';

export const AuthenticatorRoute = express.Router();

AuthenticatorRoute.post('/', async (req: Request, res: Response) => {
    const formData = req.body;

    if (!formData.email || !formData.password) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const token = await AuthenticatorController.generateToken(formData);

        return res.status(200).json({ token });
    } catch(error: any) {
        return res.status(400).json({ message: error.message });
    }
});

export const authenticateUser = async (req: Request, res: Response) => {
    const bearerToken = req.headers.authorization;

    const token = bearerToken?.split(' ')[1];

    if(!token) {
        return res.status(401).json({ message: 'Missing authorization token' });
    }

    const authData: any = await AuthenticatorController.validateToken(token);

    if(!authData.isValid) {
        return res.status(401).json({ message: 'Invalid authorization token' });
    }

    return authData.idUser;
}