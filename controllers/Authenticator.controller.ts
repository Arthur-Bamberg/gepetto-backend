import { Authenticator } from "../models/Authenticator.class";

export class AuthenticatorController {
    public static async generateToken(payload: any) {
        return await Authenticator.generateToken(payload.email, payload.password);
    }

    public static async validateToken(token: string): Promise<{idUser: number, isValid: boolean} | void> {
        return await Authenticator.validateToken(token);
    }
}