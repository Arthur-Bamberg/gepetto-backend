import { v4 as uuidv4 } from 'uuid';
import { Connector } from "../utils/Connector";
import { ChatGPT } from "./ChatGPT.class";

export enum Type {
    PROMPT = 'PROMPT',
    ANSWER = 'ANSWER'
}

export class Message {
    private _guidMessage?: string;
    private _content?: string;
    private _type?: Type;
    private _FK_idSection?: number;
    private _isAlternativeAnswer?: boolean;
    private _isActive?: boolean;
    private _connector: Connector;

    constructor(
        content: string,
        type: Type,
        FK_idSection: number,
        isAlternativeAnswer?: boolean,
        guidMessage?: string,
        isActive?: boolean
    ) {
        this.guidMessage = guidMessage;
        this.content = content;
        this.type = type;
        this.FK_idSection = FK_idSection;
        this.isAlternativeAnswer = isAlternativeAnswer ?? false;
        this._isActive = isActive ?? true;
        this._connector = new Connector();
    }

    get guidMessage(): string | undefined {
        return this.formatGuid(this._guidMessage);
    }

    set guidMessage(value: string | undefined) {
        if(value !== undefined) {
            this._guidMessage = value.replace(/-/g, '');

        } else {
            this._guidMessage = value;
        }
    }

    get content(): string | undefined {
        return this._content;
    }

    set content(value: string) {
        this._content = value;
    }

    get type(): Type | undefined {
        return this._type;
    }

    set type(value: Type) {
        if (Object.values(Type).includes(value)) {
            this._type = value;
        } else {
            throw new Error('Invalid value for type');
        }
    }

    get FK_idSection(): number | undefined {
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

    public async saveAndGetAnswer(): Promise<Message | void> {
        try {
            if (!this._content) {
                throw new Error('Missing content');   
            }
            const lastMessage = await this.getLastMessageContent(this._FK_idSection ?? 0);

            const content = await ChatGPT.getAnswer(this._content, lastMessage);

            this.guidMessage = uuidv4();

            const answerGuid = uuidv4();

            this.save(answerGuid.replace(/-/g, ''), content);

            const message = new Message(content, Type.ANSWER, this._FK_idSection ?? 0, this._isAlternativeAnswer, answerGuid);

            return message;
        } catch (error) {
            console.error('Error getting answer:', error);
        }
    }

    private async save(answerGuid: string, answerContent: string): Promise<void> {
        const messageSql = `
            INSERT INTO message (guidMessage, content, type, FK_idSection, isAlternativeAnswer, isActive)
            VALUES (?, ?, ?, ?, ?, ?);
        `;
        const messageValues = [
            this._guidMessage,
            this._content,
            this._type,
            this._FK_idSection,
            this._isAlternativeAnswer,
            this._isActive,
            this._FK_idSection
        ];

        const answerValues = [
            answerGuid,
            answerContent,
            Type.ANSWER,
            this._FK_idSection,
            this._isAlternativeAnswer,
            this._isActive,
            this._FK_idSection
        ];

        const sectionSql = `
            UPDATE section
            SET FK_guidLastMessage = ?
            WHERE idSection = ?;
        `;

        const sectionValues = [this._guidMessage, this._FK_idSection];

        try {
            await this._connector.beginTransaction();

            await this._connector.query(messageSql, messageValues);

            await this._connector.query(sectionSql, sectionValues);

            await this._connector.query(messageSql, answerValues);

            await this._connector.commit();

        } catch (err) {
            await this._connector.rollback();
            console.error('Error saving message:', err);
        } finally {
            await this._connector.disconnect();
        }
    }

    public async update(): Promise<void> {
        const sql = `
            UPDATE message
            SET content = ?, type = ?, FK_idSection = ?, isAlternativeAnswer = ?, isActive = ?
            WHERE guidMessage = ?
        `;
        const values = [
            this._content,
            this._type,
            this._FK_idSection,
            this._isAlternativeAnswer,
            this._isActive,
            this._guidMessage
        ];
        try {
            await this._connector.connect();
            await this._connector.query(sql, values);
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
            WHERE guidMessage = ?
        `;
        const values = [this._guidMessage];
        try {
            await this._connector.connect();
            await this._connector.query(sql, values);
            this.isActive = false;
        } catch (err) {
            console.error('Error deleting message:', err);
        } finally {
            await this._connector.disconnect();
        }
    }

    public static async getByGuid(id: string): Promise<Message | null> {
        const sql = `
            SELECT guidMessage, content, type, FK_idSection, isAlternativeAnswer, isActive
            FROM message
            WHERE guidMessage = ?
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
                row.guidMessage,
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

    private async getLastMessageContent(idSection: number): Promise<string | null> {
        const sql = `
            SELECT 
                message.content
            FROM message
                INNER JOIN section 
                    ON message.guidMessage = section.FK_guidLastMessage
            WHERE 
                section.idSection = ?
        `;
        const values = [idSection];

        try {
            await this._connector.connect();

            const rows = await this._connector.query(sql, values);
            if (rows.length === 0) {
                return null;
            }
            return rows[0].content;
        } catch (err) {
            console.error('Error getting last message content:', err);
            return null;
        }
    }

    private formatGuid(guid: string | undefined) {
        if (guid !== undefined && guid.length === 32) {
          return (
            guid.substring(0, 8) +
            '-' +
            guid.substring(8, 12) +
            '-' +
            guid.substring(12, 16) +
            '-' +
            guid.substring(16, 20) +
            '-' +
            guid.substring(20)
          );
        }
    }

    public json() {
        return {
            guidMessage: this.guidMessage,
            content: this.content,
            type: this.type,
            idSection: this.FK_idSection,
            isAlternativeAnswer: this.isAlternativeAnswer,
            isActive: this._isActive
        };
    }
}