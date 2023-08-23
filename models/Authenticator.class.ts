import { User } from "./User.class";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export class Authenticator {
    private static secretKey: string = process.env.SECRET_KEY as string;

    public static async generateToken(email: string, password: string): Promise<string> {
        const userData = await User.validateLogin(email, password);

        if (!userData) {
            throw new Error('Invalid credentials');
        }

        const payload = await User.updateAuthentication(userData);

        return this.signJWT(payload);
    }

    public static async validateToken(token: string): Promise<{ idUser: number, isValid: boolean } | void> {
        return await new Promise<{ idUser: number, isValid: boolean } | void>((resolve) => {
            jwt.verify(token, Authenticator.secretKey, async (err, decoded: any) => {
                if (err) {
                    console.error('Token verification failed:', err.message);
                    resolve({
                        idUser: 0,
                        isValid: false
                    });
                } else {
                    resolve({
                        idUser: decoded.idUser,
                        isValid: await User.tokenIsValid(decoded)
                    });
                }
            });
        })
    }

    public static signJWT(payload: any): string {
        return jwt.sign(payload, Authenticator.secretKey);
    }
}