import { Connector } from "../utils/Connector";
import { Message } from "./Message.class";

export class Section {
	private _idSection?: number;
	private _name: string;
	private _lastMessage?: Message;
	private _messages?: any [];
	private _isActive?: boolean;
	private _connector: Connector;

	constructor(name: string, idSection?: number, isActive?: boolean, lastMessage?: Message) {
		this._name = name;
		this._idSection = idSection;
		this._isActive = isActive ?? true;
		this._lastMessage = lastMessage;
		this._connector = new Connector();
	}

	get idSection(): number | undefined {
		return this._idSection;
	}

	set idSection(id: number | undefined) {
		if (id !== undefined && id <= 0) {
			throw new Error('idSection must be a positive number.');
		}
		this._idSection = id;
	}

	get name(): string {
		return this._name;
	}

	set name(name: string) {
		this._name = name;
	}

	public async getLastMessage(): Promise<Message | null> {
		if (this._lastMessage === undefined) {
			const sql = `
            SELECT 
                message.guidMessage, 
                message.content, 
                message.type, 
                message.isAlternativeAnswer, 
                message.isActive,
                message.FK_idSection

            FROM message

			INNER JOIN section 
				ON section.FK_guidLastMessage = message.guidMessage

            WHERE section.idSection = ?
        `;
			const values = [this._idSection];
			try {
				await this._connector.connect();
				const rows = await this._connector.query(sql, values);

				if (rows.length === 0) {
					return null;
				}

				const message = new Message(rows[0].content, rows[0].type, rows[0].FK_idSection, rows[0].isAlternativeAnswer, rows[0].isActive, rows[0].guidMessage);

				this._lastMessage = message;
			} catch (err) {
				console.error('Error getting messages:', err);
				return null;
			}
		}

		return this._lastMessage;
	}

	set lastMessage(message: Message | undefined) {
		this._lastMessage = message;
	}

	get isActive(): boolean | undefined {
		return this._isActive;
	}

	set isActive(active: boolean | undefined) {
		this._isActive = active;
	}

	public async getMessages(): Promise<any[] | null> {
		if (this._messages === undefined) {
			const sql = `
            SELECT 
                message.guidMessage, 
                message.content, 
                message.type, 
                message.isAlternativeAnswer, 
                message.isActive,
                message.FK_idSection

            FROM message

            WHERE 
				message.FK_idSection = ?
				AND message.isActive = 1

			ORDER BY message.createdOn ASC, message.type ASC
        `;
			const values = [this._idSection];
			try {
				await this._connector.connect();
				const rows = await this._connector.query(sql, values);

				if (rows.length === 0) {
					return null;
				}

				const messages = [];
				for (const row of rows) {
					messages.push(new Message(row.content, row.type, row.FK_idSection, row.isAlternativeAnswer, row.guidMessage, row.isActive).json());
				}
				this._messages = messages;
			} catch (err) {
				console.error('Error getting messages:', err);
				return [];
			}
		}

		return this._messages;
	}

	public async create(idUser: number): Promise<void> {
		await this._connector.connect();
		await this._connector.beginTransaction();

		await this.save();
		this.addToUser(idUser).then(
			async ()=> {
				await this._connector.commit();
			} 
		);
	}

	private async save(): Promise<void> {
		const sql = `
            INSERT INTO section (name, isActive)
            VALUES (?, ?)
        `;
		const values = [this._name, this._isActive];
		try {
			await this._connector.query(sql, values);
			this._idSection = this._connector.getLastInsertedId();
		} catch (err) {
			console.error('Error saving section:', err);
		}
	}

	public static async getAll(idUser: number): Promise<any[] | null> {
		const sql = `
            SELECT 
				section.idSection, 
				section.name, 
				section.isActive,

				message.guidMessage,
				message.content,
				message.type,
				message.isAlternativeAnswer,
				message.isActive as messageIsActive

            FROM section
				INNER JOIN userSection
					ON section.idSection = userSection.FK_idSection

				LEFT JOIN message
					ON section.FK_guidLastMessage = message.guidMessage
					
			WHERE 
				userSection.FK_idUser = ?
				AND section.isActive = 1`;

		const connector = new Connector();

		const values = [idUser];

		try {
			await connector.connect();
			const rows = await connector.query(sql, values);
			const sections:any[] = [];
			
			if (rows.length === 0) {
				return null;
			}

			rows.forEach((row) => {
				if(row.guidMessage !== null) {
					const message = new Message(row.content, row.type, row.idSection, row.isAlternativeAnswer, row.guidMessage, row.messageIsActive);	

					sections.push(new Section(row.name, row.idSection, row.isActive, message).json());
				} else {
					sections.push(new Section(row.name, row.idSection, row.isActive).json());
				}
			});

			return sections;

		} catch (err) {
			console.error('Error fetching sections:', err);
			return null;
		}
	}

	public async update(): Promise<void> {
		const sql = `
            UPDATE section
            SET name = ?, isActive = ?
            WHERE idSection = ?
        `;
		const values = [this._name, this._isActive, this._idSection];
		try {
			await this._connector.connect();
			await this._connector.query(sql, values);
		} catch (err) {
			console.error('Error updating section:', err);
		}
	}

	public async delete(): Promise<void> {
		const sql = `
            UPDATE section
            SET isActive = 0
            WHERE idSection = ?
        `;
		const values = [this._idSection];
		try {
			await this._connector.connect();
			await this._connector.query(sql, values);

			this.isActive = false;
		} catch (err) {
			console.error('Error deleting section:', err);
		}
	}

	private async addToUser(idUser: number): Promise<void> {
        const sql = `
            INSERT INTO userSection (FK_idUser, FK_idSection)
            VALUES (?, ?)
        `;
        const values = [idUser, this.idSection];

        try {
            await this._connector.connect();
            await this._connector.query(sql, values);
        } catch (err) {
            console.error('Error adding user to section:', err);
        }
    }

	public async removeFromUser(idUser: number): Promise<void> {
        const sql = `
            DELETE FROM userSection
            WHERE FK_idUser = ? AND FK_idSection = ?
        `;
        const values = [idUser, this.idSection];

        try {
            await this._connector.connect();
            await this._connector.query(sql, values);
        } catch (err) {
            console.error('Error removing section from user:', err);
        }
    }

	public static async getById(idSection: number, idUser: number): Promise<Section | null> {
		const sql = `
            SELECT idSection, name, isActive
            FROM section
				INNER JOIN userSection
					ON section.idSection = userSection.FK_idSection
            WHERE 
				idSection = ?
				AND userSection.FK_idUser = ?
        `;
		const values = [idSection, idUser];

		const connector = new Connector();

		try {
			await connector.connect();
			const rows = await connector.query(sql, values);
			if (rows.length === 0) {
				return null;
			}
			const row = rows[0];
			const section = new Section(row.name, row.idSection, row.isActive);
			return section;
		} catch (err) {
			console.error('Error fetching section by ID:', err);
			return null;
		}
	}

	public json() {
		return {
			idSection: this._idSection,
			name: this._name,
			isActive: this._isActive,
			lastMessage: this._lastMessage?.json().content ?? ''
		};
	}
}