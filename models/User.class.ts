import { v4 as uuidv4 } from 'uuid';
import { Connector } from "../utils/Connector";
import dotenv from 'dotenv';
dotenv.config();

type ChangePasswordReturn = {
    isValid: boolean,
    link: string
};

type Sex = 'M' | 'F' | null;

export class User {
    private _idUser?: number;
    private _name!: string;
    private _email!: string;
    private _city?: string;
    private _sex?: Sex;
    private _password?: string;
    private _isActive?: boolean;
    private iat?: number;
    private exp?: number;
    private static _safeParams: string = 'user.idUser, user.name, user.city, user.sex, user.email, user.isActive';
    private _connector: Connector;

    constructor(
        name: string,
        email: string,
        password?: string,
        city?: string,
        sex?: Sex,
        idUser?: number,
        isActive?: boolean
    ) {
        this.name = name;
        this.email = email;
        this.city = city;
        this.sex = sex;
        this.idUser = idUser;
        this.isActive = isActive ?? true;

        if(password) {
            this.password = password;
        }

        this._connector = new Connector();
    }

    set idUser(value: number | undefined) {
        if (value !== undefined && value <= 0) {
            throw new Error('idUser deve ser um número positivo.');
        }
        this._idUser = value;
    }

    set name(value: string) {
        if (!value || value.trim().length === 0) {
            throw new Error('name não pode estar vazio.');
        }
        this._name = value;
    }

    set city(value: string | undefined) {
        this._city = value;
    }

    set sex(value: Sex | undefined) {
        this._sex = value;
    }

    set email(value: string) {
        if (!value || value.trim().length === 0) {
            throw new Error('email não pode estar vazio.');
        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
            throw new Error('Formato de email inválido.');
        }
        this._email = value;
    }

    set password(value: string) {
        if (!value || value.trim().length === 0) {
            throw new Error('password não pode estar vazia.');
        }
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/
;
        if (!passwordPattern.test(value)) {
            throw new Error('password deve conter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais.');
        }
        this._password = value;
    }

    set isActive(value: boolean | undefined) {
        this._isActive = value;
    }

    public async save(): Promise<void> {
        const userTime = this.getAndSetUserTime();

        const sql = `
            INSERT INTO user (name, city, sex, email, password, isActive, issuedAt)
            VALUES (?, ?, ?, ?, md5(sha1(?)), ?, ?)
        `;
        const values = [this._name, this._city, this._sex, this._email, this._password, this._isActive, new Date(userTime.issuedAt)];
        try {
            await this._connector.connect();
            await this._connector.query(sql, values);
            this._idUser = this._connector.getLastInsertedId();
        } catch (err) {
            console.error('Error saving user:', err);
        }
    }

    public async update(): Promise<void> {
        const userTime = this.getAndSetUserTime();

        const sql = `
            UPDATE user
            SET name = ?, city = ?, sex = ?, issuedAt = ?
            WHERE idUser = ?
        `;
        const values = [this._name, this._city, this._sex, new Date(userTime.issuedAt), this._idUser];
        try {
            await this._connector.connect();
            await this._connector.query(sql, values);
        } catch (err) {
            console.error('Error updating user:', err);
        }
    }

    public static async changePassword(idUser: number, password: string): Promise<void> {
        const sql = `
            UPDATE user
            SET 
                password = md5(sha1(?)), 
                issuedAt = NOW(),
                changePasswordId = NULL,
                changePasswordExpires = NULL

            WHERE idUser = ?
        `;
        const values = [password, idUser];

        const connector = new Connector();

        try {
            await connector.connect();
            await connector.query(sql, values);

        } catch (err) {
            console.error("Error changing user's password:", err);
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
            const user = new User(
                row.name, 
                row.email, 
                row.password,
                row.city,
                row.sex, 
                row.idUser, 
                row.isActive
            );
            return user;
        } catch (err) {
            console.error('Error fetching user by ID:', err);
            return null;
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
            const user = new User(
                row.name, 
                row.email, 
                password, 
                row.city,
                row.sex,
                row.idUser, 
                row.isActive
            );
            return user.json();
        } catch (err) {
            console.error('Error validating user login:', err);
            return null;
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

        userTime.exp = Math.floor(userTime.issuedAt / 1000) + 30 * 24 * (60 * 60); // 30 days

        return userTime;
    }

    public static async enableChangePassword(name:string, email:string): Promise< ChangePasswordReturn | void > {
        const selectQuery = `
            SELECT idUser
            FROM user
            WHERE 
                name = ?
                AND email = ?                 
                AND isActive = 1
            LIMIT 1
        `;

        const selectValues = [name, email];

        const updateQuery = `
            UPDATE user
            SET 
                changePasswordId = ?,
                changePasswordExpires = DATE_ADD(NOW(), INTERVAL 1 DAY)
            WHERE idUser = ?
        `;

        const changePasswordId = `${uuidv4().replace(/-/g, '')}${uuidv4().replace(/-/g, '')}`;

        const connector = new Connector();

        try {
            await connector.connect();
            const rows = await connector.query(selectQuery, selectValues);

            if (rows.length === 0) {
                return {
                    isValid: false,
                    link: ''
                };
            }

            const idUser = rows[0].idUser;

            const updateValues = [changePasswordId, idUser];

            connector.query(updateQuery, updateValues);

            return {
                isValid: true,
                link: `${process.env.NGROK_DOMAIN}/change-password/${changePasswordId}`
            };

        } catch (err) {
            console.error('Error enabling change password:', err);
        }
    }

    public static async authenticateByChangePasswordId(changePasswordId: string) {
        const selectQuery = `
            SELECT idUser
            FROM user
            WHERE 
                changePasswordId = ?
                AND changePasswordExpires >= now()               
                AND isActive = 1
            LIMIT 1
        `;

        const selectValues = [changePasswordId];

        const connector = new Connector();

        try {
            await connector.connect();
            const rows = await connector.query(selectQuery, selectValues);

            if(rows.length === 0) {
                return null;
            }

            return parseInt(rows[0].idUser);

        } catch (err) {
            console.error('Error enabling changing password:', err);
        }
    }

    public json() {
        return {
            idUser: this._idUser,
            name: this._name,
            city: this._city,
            sex: this._sex,
            email: this._email,
            isActive: this._isActive,
            iat: this.iat,
            exp: this.exp
        };
    }
}
