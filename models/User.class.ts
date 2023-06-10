export class User {
    private _idUser: number;
    private _name: string;
    private _email: string;
    private _password: string;
    private _isActive: boolean;

    constructor(
        idUser: number,
        name: string,
        email: string,
        password: string,
        isActive: boolean
    ) {
        this._idUser = idUser;
        this._name = name;
        this._email = email;
        this._password = password;
        this._isActive = isActive;
    }

    get idUser(): number {
        return this._idUser;
    }

    set idUser(value: number) {
        if (value <= 0) {
            throw new Error('idUser must be a positive number.');
        }
        this._idUser = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        if (!value || value.trim().length === 0) {
            throw new Error('name cannot be empty.');
        }
        this._name = value;
    }

    get email(): string {
        return this._email;
    }

    set email(value: string) {
        if (!value || value.trim().length === 0) {
            throw new Error('email cannot be empty.');
        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
            throw new Error('Invalid email format.');
        }
        this._email = value;
    }

    get password(): string {
        return this._password;
    }

    set password(value: string) {
        if (!value || value.trim().length === 0) {
            throw new Error('password cannot be empty.');
        }
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordPattern.test(value)) {
            throw new Error('password must contain at least 8 characters, including uppercase, lowercase, digit, and special characters.');
        }
        this._password = value;
    }

    get isActive(): boolean {
        return this._isActive;
    }

    set isActive(value: boolean) {
        this._isActive = value;
    }
}
