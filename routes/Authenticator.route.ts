import express, { Request, Response } from 'express';
import { AuthenticatorController } from '../controllers/Authenticator.controller';
import { Connector } from '../utils/Connector';

export const AuthenticatorRoute = express.Router();

AuthenticatorRoute.post('/', async (req: Request, res: Response) => {
    const formData = req.body;

    if (!formData.email || !formData.password) {
        return res.status(400).json({ message: {
            en: 'Missing required fields',
            pt: 'Campos obrigatórios faltando!'
        } });
    }

    try {
        const token = await AuthenticatorController.generateToken(formData);

        return res.status(200).json({ token });

    } catch(error: any) {
        return res.status(400).json({ message: error.message });

    } finally {
        Connector.closeConnection();
    }
});

export const authenticateUser = async (req: Request, res: Response) => {
    const bearerToken = req.headers.authorization;

    const token = bearerToken?.split(' ')[1];

    try {
        if(!token) {
            return res.status(401).json({ message: {
                en: 'Missing authorization token',
                pt: 'Token de autorização faltando!'
            } });
        }

        const authData: any = await AuthenticatorController.validateToken(token);

        if(!authData.isValid) {
            return res.status(401).json({ message: {
                en: 'Invalid token',
                pt: 'Token inválido!'
            } });
        }

        return authData.idUser;
        
    } catch(error: any) {
        return res.status(400).json({ message: error.message });
    }
}