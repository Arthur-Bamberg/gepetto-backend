import { Connector } from "../utils/Connector";

enum Type {
    PROMPT = 'PROMPT',
    ANSWER = 'ANSWER'
}

export class Message {
    private _idMessage: number;
    private _type: Type;
    private _isAlternativeAnswer: boolean;
    private _isActive: boolean;
    private _connector: Connector;

    constructor(
        idMessage: number,
        type: Type,
        isAlternativeAnswer: boolean,
        isActive: boolean
    ) {
        this._idMessage = idMessage;
        this._type = type;
        this._isAlternativeAnswer = isAlternativeAnswer;
        this._isActive = isActive;
        this._connector = new Connector();
    }

    get idMessage(): number {
        return this._idMessage;
    }

    set idMessage(value: number) {
        if (value >= 0) {
            this._idMessage = value;
        } else {
            throw new Error('Invalid value for idMessage');
        }
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

    get isAlternativeAnswer(): boolean {
        return this._isAlternativeAnswer;
    }

    set isAlternativeAnswer(value: boolean) {
        this._isAlternativeAnswer = value;
    }

    get isActive(): boolean {
        return this._isActive;
    }

    set isActive(value: boolean) {
        this._isActive = value;
    }

    public async save(): Promise<void> {
        const sql = `
          INSERT INTO message (idMessage, type, isAlternativeAnswer, isActive)
          VALUES (?, ?, ?, ?)
        `;
        const values = [
            this._idMessage,
            this._type,
            this._isAlternativeAnswer,
            this._isActive
        ];
        try {
            await this._connector.connect();
            await this._connector.query(sql, values);
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
          SET type = ?, isAlternativeAnswer = ?, isActive = ?
          WHERE idMessage = ?
        `;
        const values = [
            this._type,
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
          SELECT idMessage, type, isAlternativeAnswer, isActive
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
                row.idMessage,
                row.type,
                row.isAlternativeAnswer,
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
