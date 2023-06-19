import { Connector } from "../utils/Connector";
import { Section } from "./Section.class";

export class User {
    private _idUser?: number;
    private _name: string;
    private _email: string;
    private _password?: string;
    private _isActive?: boolean;
    private _sections?: Section[];
    private static _safeParams: string = 'user.idUser, user.name, user.email, user.isActive';
    private _connector: Connector;

    constructor(
        name: string,
        email: string,
        password?: string,
        idUser?: number,
        isActive?: boolean
    ) {
        this._name = name;
        this._email = email;
        this._password = password;
        this._idUser = idUser;
        this._isActive = isActive ?? true;
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

    public async getAllSections(): Promise<Section[] | null> {
        const sql =
            `SELECT 
            section.idSection, section.name, section.temperature, section.isActive
        FROM section
            INNER JOIN userSection
                ON section.idSection = userSection.FK_idSection
        WHERE 
            userSection.FK_idUser = ?
            and section.isActive = 1
        `;

        const values = [this._idUser];

        const connector = new Connector();

        try {
            await connector.connect();
            const rows = await connector.query(sql, values);
            this._sections = rows.map((row) => new Section(row.name, row.temperature, row.idSection, row.isActive));
            return this._sections;
        } catch (err) {
            console.error("Error fetching user's sections:", err);
            return [];
        } finally {
            await connector.disconnect();
        }
    }

    public async addSection(section: Section): Promise<void> {
        const sql = `
            INSERT INTO userSection (FK_idUser, FK_idSection)
            VALUES (?, ?)
        `;
        const values = [this._idUser, section.idSection];

        try {
            await this._connector.connect();
            await this._connector.query(sql, values);
            if (!this._sections) {
                this._sections = [];
            }
            this._sections.push(section);
            console.log('Section added successfully.');
        } catch (err) {
            console.error('Error adding section:', err);
        } finally {
            await this._connector.disconnect();
        }
    }

    public async removeSection(section: Section): Promise<void> {
        const sql = `
            DELETE FROM userSection
            WHERE FK_idUser = ? AND FK_idSection = ?
        `;
        const values = [this._idUser, section.idSection];

        try {
            await this._connector.connect();
            await this._connector.query(sql, values);
            if (this._sections) {
                const sectionIndex = this._sections.findIndex((s) => s.idSection === section.idSection);
                if (sectionIndex !== -1) {
                    this._sections.splice(sectionIndex, 1);
                }
            }
            console.log('Section removed successfully.');
        } catch (err) {
            console.error('Error removing section:', err);
        } finally {
            await this._connector.disconnect();
        }
    }

    public async save(): Promise<void> {
        const sql = `
            INSERT INTO user (name, email, password, isActive)
            VALUES (?, ?, ?, ?)
        `;
        const values = [this._name, this._email, this._password, this._isActive];
        try {
            await this._connector.connect();
            await this._connector.query(sql, values);
            console.log('User saved successfully.');
        } catch (err) {
            console.error('Error saving user:', err);
        } finally {
            await this._connector.disconnect();
        }
    }

    public async update(): Promise<void> {
        const sql = `
            UPDATE user
            SET name = ?, email = ?
            WHERE idUser = ?
        `;
        const values = [this._name, this._email, this._idUser];
        try {
            await this._connector.connect();
            await this._connector.query(sql, values);
            console.log('User updated successfully.');
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
            console.log('User deleted successfully.');
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
}
