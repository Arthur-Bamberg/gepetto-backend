import { Connector } from "../utils/Connector";

export enum Type {
    PROMPT = 'PROMPT',
    ANSWER = 'ANSWER'
}

export class Message {
    private _idMessage?: number;
    private _content: string;
    private _type: Type;
    private _FK_idSection: number;
    private _isAlternativeAnswer?: boolean;
    private _isActive?: boolean;
    private _connector: Connector;

    constructor(
        content: string,
        type: Type,
        FK_idSection: number,
        isAlternativeAnswer?: boolean,
        idMessage?: number,
        isActive?: boolean
    ) {
        this._idMessage = idMessage;
        this._content = content;
        this._type = type;
        this._FK_idSection = FK_idSection;
        this._isAlternativeAnswer = isAlternativeAnswer ?? false;
        this._isActive = isActive ?? true;
        this._connector = new Connector();
    }

    get idMessage(): number | undefined {
        return this._idMessage;
    }

    set idMessage(value: number | undefined) {
        if (value === undefined || value >= 0) {
            this._idMessage = value;
        } else {
            throw new Error('Invalid value for idMessage');
        }
    }

    get content(): string {
        return this._content;
    }

    set content(value: string) {
        this._content = value;
    }

    get type(): Type {
        return this._type;
    }

    set type(value: Type) {
        if (Object.values(Type).includes(value)) {
            this._type = value;
        } else {
            throw new Error('Invalid value for type');
        }
    }

    get FK_idSection(): number {
        return this._FK_idSection;
    }

    set FK_idSection(value: number) {
        this._FK_idSection = value;
    }

    get isAlternativeAnswer(): boolean | undefined {
        return this._isAlternativeAnswer;
    }

    set isAlternativeAnswer(value: boolean | undefined) {
        this._isAlternativeAnswer = value;
    }

    get isActive(): boolean | undefined {
        return this._isActive;
    }

    set isActive(value: boolean | undefined) {
        this._isActive = value;
    }

    public async save(): Promise<void> {
        const sql = `
            INSERT INTO message (content, type, FK_idSection, isAlternativeAnswer, isActive)
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [
            this._content,
            this._type,
            this._FK_idSection,
            this._isAlternativeAnswer,
            this._isActive
        ];
        try {
            await this._connector.connect();
            await this._connector.query(sql, values);
            this._idMessage = await this._connector.getLastInsertedId();
            console.log('Message saved successfully.');
        } catch (err) {
            console.error('Error saving message:', err);
        } finally {
            await this._connector.disconnect();
        }
    }

    public async update(): Promise<void> {
        const sql = `
            UPDATE message
            SET content = ?, type = ?, FK_idSection = ?, isAlternativeAnswer = ?, isActive = ?
            WHERE idMessage = ?
        `;
        const values = [
            this._content,
            this._type,
            this._FK_idSection,
            this._isAlternativeAnswer,
            this._isActive,
            this._idMessage
        ];
        try {
            await this._connector.connect();
            await this._connector.query(sql, values);
            console.log('Message updated successfully.');
        } catch (err) {
            console.error('Error updating message:', err);
        } finally {
            await this._connector.disconnect();
        }
    }

    public async delete(): Promise<void> {
        const sql = `
            UPDATE message
            SET isActive = 0
            WHERE idMessage = ?
        `;
        const values = [this._idMessage];
        try {
            await this._connector.connect();
            await this._connector.query(sql, values);
            console.log('Message deleted successfully.');
        } catch (err) {
            console.error('Error deleting message:', err);
        } finally {
            await this._connector.disconnect();
        }
    }

    public static async getById(id: number): Promise<Message | null> {
        const sql = `
            SELECT idMessage, content, type, FK_idSection, isAlternativeAnswer, isActive
            FROM message
            WHERE idMessage = ?
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
            const message = new Message(
                row.content,
                row.type,
                row.FK_idSection,
                row.isAlternativeAnswer,
                row.idMessage,
                row.isActive
            );
            return message;
        } catch (err) {
            console.error('Error fetching message by ID:', err);
            return null;
        } finally {
            await connector.disconnect();
        }
    }
}