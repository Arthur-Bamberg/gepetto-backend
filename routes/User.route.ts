import express, { Request, Response } from 'express';
import { UserController } from '../controllers/User.controller';
import { authenticateUser } from './Authenticator.route';
import { Connector } from '../utils/Connector';

export const UserRoute = express.Router();

UserRoute.post('/', async (req: Request, res: Response) => {
    try {
        const formData = req.body;

        if (!formData.name || !formData.email || !formData.password) {
            return res.status(400).json({ message: {
                en: 'Missing required fields',
                pt: 'Campos obrigatórios faltando!'
            } });
        }

        if (!await UserController.emailIsUnique(formData.email)) {
            return res.status(400).json({ message: {
                en: 'Email already registered',
                pt: 'Email já cadastrado!'
            } });
        }

        const token = await UserController.createUser(formData);

        res.status(201).json({ token });

    } catch (error: any) {
        return res.status(400).json({ message: error.message });

    } finally {
        Connector.closeConnection();
    }
});

UserRoute.patch('/:changePasswordId', async (req: Request, res: Response) => {
    try {
        const idUser = await UserController.authenticateByChangePasswordId(req.params.changePasswordId);

        if (typeof idUser != "number") {
            return res.status(404).json({ message: {
                en: 'Invalid idUser!',
                pt: 'Identificador de usuário inválido!'
            } });
        }

        const password = req.body.password;

        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/
;
        if (!passwordPattern.test(password)) {
            return res.status(400).json({ message: {
                en: 'password must contain at least 8 characters, including uppercase, lowercase, digit, and special characters.',
                pt: 'A senha deve conter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas, dígitos e caracteres especiais.'
            } });
        }

        await UserController.changePassword(idUser, password);

        res.status(200).json({
            status: 'success',
            message: 'Password changed successfully!' 
        });

    } catch (error: any) {
        return res.status(400).json({ message: error.message });

    } finally {
        Connector.closeConnection();
    }
});

UserRoute.delete('/', async (req: Request, res: Response) => {
    try {
        const idUser = await authenticateUser(req, res);

        if (typeof idUser != "number") return;

        if (isNaN(idUser)) {
            return res.status(404).json({ message: {
                en: 'Invalid idUser!',
                pt: 'Identificador de usuário inválido!'
            } });
        }

        const user = await UserController.getUser(idUser);

        if (!user) {
            return res.status(404).json({ message: {
                en: 'user not found!',
                pt: 'Usuário não encontrado!'
            } });
        }

        await UserController.deleteUser(user);

        res.status(200).json(user.json());

    } catch (error: any) {
        return res.status(400).json({ message: error.message });

    } finally {
        Connector.closeConnection();
    }
});