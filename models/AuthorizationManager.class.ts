import jwt from 'jsonwebtoken';
import crypto from 'crypto';

class AuthorizationManager {
    private secretKey: string;

    constructor() {
        this.secretKey = crypto.randomBytes(32).toString('hex');
    }

    public validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    public validatePassword(password: string): boolean {
        const minimumLength = 8;
        return password.length >= minimumLength;
    }

    public generateToken(email: string): string {
        const payload = { email };
        const options = { expiresIn: '1 day' };

        return jwt.sign(payload, this.secretKey, options);
    }
}
