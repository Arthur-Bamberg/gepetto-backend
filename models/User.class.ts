import { Connector } from "../utils/Connector";

export class User {
    private _idUser?: number;
    private _name!: string;
    private _email!: string;
    private _password?: string;
    private _isActive?: boolean;
    private iat?: number;
    private exp?: number;
    private static _safeParams: string = 'user.idUser, user.name, user.email, user.isActive';
    private _connector: Connector;

    constructor(
        name: string,
        email: string,
        password?: string,
        idUser?: number,
        isActive?: boolean
    ) {
        this.name = name;
        this.email = email;
        this.idUser = idUser;
        this.isActive = isActive ?? true;

        if(password) {
            this.password = password;
        }

        this._connector = new Connector();
    }

    get idUser(): number | undefined {
        return this._idUser;
    }

    set idUser(value: number | undefined) {
        if (value !== undefined && value <= 0) {
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

    get isActive(): boolean | undefined {
        return this._isActive;
    }

    set isActive(value: boolean | undefined) {
        this._isActive = value;
    }

    public async save(): Promise<void> {
        const userTime = this.getAndSetUserTime();

        const sql = `
            INSERT INTO user (name, email, password, isActive, issuedAt)
            VALUES (?, ?, md5(sha1(?)), ?, ?)
        `;
        const values = [this._name, this._email, this._password, this._isActive, new Date(userTime.issuedAt)];
        try {
            await this._connector.connect();
            await this._connector.query(sql, values);
            this._idUser = await this._connector.getLastInsertedId();
        } catch (err) {
            console.error('Error saving user:', err);
        } finally {
            await this._connector.disconnect();
        }
    }

    public async update(): Promise<void> {
        const userTime = this.getAndSetUserTime();

        const sql = `
            UPDATE user
            SET name = ?, email = ?, password = md5(sha1(?)), isActive = ?, issuedAt = ?
            WHERE idUser = ?
        `;
        const values = [this._name, this._email, this._password, this._isActive, new Date(userTime.issuedAt), this._idUser];
        try {
            await this._connector.connect();
            await this._connector.query(sql, values);
        } catch (err) {
            console.error('Error updating user:', err);
        } finally {
            await this._connector.disconnect();
        }
    }

    public async delete(): Promise<void> {
        const sql = `
            UPDATE user
            SET isActive = 0
            WHERE idUser = ?
        `;
        const values = [this._idUser];
        try {
            await this._connector.connect();
            await this._connector.query(sql, values);
            this.isActive = false;
        } catch (err) {
            console.error('Error deleting user:', err);
        } finally {
            await this._connector.disconnect();
        }
    }

    public static async getById(id: number): Promise<User | null> {
        const sql = `
            SELECT ${User._safeParams}
            FROM user
            WHERE idUser = ?
        `;
        const values = [id];

        const connector = new Connector();

        try {
            await connector.connect();
            const rows = await connector.query(sql, values);
            if (rows.length === 0) {
                return null;
            }
            const row = rows[0];
            const user = new User(row.name, row.email, row.password, row.idUser, row.isActive);
            return user;
        } catch (err) {
            console.error('Error fetching user by ID:', err);
            return null;
        } finally {
            await connector.disconnect();
        }
    }

    public static async validateLogin(email: string, password: string): Promise<object | null> {
        const sql = `
            SELECT ${User._safeParams}
            FROM user
            WHERE email = ? AND password = md5(sha1(?)) AND isActive = 1
        `;
        const values = [email, password];

        const connector = new Connector();

        try {
            await connector.connect();
            const rows = await connector.query(sql, values);
            if (rows.length === 0) {
                return null;
            }
            const row = rows[0];
            const user = new User(row.name, row.email, password, row.idUser, row.isActive);
            return user.json();
        } catch (err) {
            console.error('Error validating user login:', err);
            return null;
        } finally {
            await connector.disconnect();
        }
    }

    public static async updateAuthentication(userData: any): Promise<any> {
        const userTime = this.getUserTime();

        userData.iat = userTime.iat;
        userData.exp = userTime.exp;

        const sql = `UPDATE user SET issuedAt = ? WHERE idUser = ?`;
        const values = [new Date(userTime.issuedAt), userData.idUser];

        const connector = new Connector();

        try {
            await connector.connect();

            await connector.query(sql, values);

            return userData;
        } catch (err) {
            console.error('Error updating authentication:', err);
        } finally {
            await connector.disconnect();
        }
    }

    public static async tokenIsValid(tokenData: any): Promise<boolean> {
        const sql = `
            SELECT idUser
            FROM user
            WHERE email = ? AND name = ? AND idUser = ? AND isActive = 1
            AND (
                issuedAt = ?
                OR issuedAt = ?
            )
        `;
        const values = [tokenData.email, tokenData.name, tokenData.idUser, new Date(tokenData.iat * 1000), new Date((tokenData.iat + 1) * 1000)];

        const connector = new Connector();

        try {
            await connector.connect();
            const rows = await connector.query(sql, values);
            if (rows.length === 0) {
                return false;
            }

            return true;
        } catch (err: any) {
            console.error('Error validating token:', err);
            return false;
        }
    }

    public static async emailIsUnique(email: string): Promise<boolean> {
        const sql = `
            SELECT idUser
            FROM user
            WHERE email = ? AND isActive = 1
        `;
        const values = [email];

        const connector = new Connector();

        try {
            await connector.connect();
            const rows = await connector.query(sql, values);
            if (rows.length === 0) {
                return true;
            }

            return false;
        } catch (err: any) {
            console.error(`Error validating email ${email} is unique:`, err);
            return false;
        }
    }

    private getAndSetUserTime() {
        const userTime = User.getUserTime();

        this.iat = userTime.iat;
        this.exp = userTime.exp;
        
        return userTime;    
    }

    private static getUserTime() {
        const userTime = {
            issuedAt: Date.now(),
            iat: 0,
            exp: 0
        };

        userTime.iat = Math.floor(userTime.issuedAt / 1000);

        userTime.exp = Math.floor(userTime.issuedAt / 1000) + 24 * (60 * 60); // 24 hours

        return userTime;
    }

    public json() {
        return {
            idUser: this._idUser,
            name: this._name,
            email: this._email,
            isActive: this._isActive,
            iat: this.iat,
            exp: this.exp
        };
    }
}
