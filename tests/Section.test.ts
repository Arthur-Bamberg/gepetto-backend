import { Connector } from '../utils/Connector';
import { Section } from '../models/Section.class';
import { Message, Type } from '../models/Message.class';

describe('Section', () => {
    let connector: Connector;

    beforeAll(() => {
        connector = new Connector();
    });

    beforeEach(async () => {
        // Ensure the section table is empty before each test
        const sqlUpdateSection = `UPDATE section SET FK_idLastMessage = NULL`;
        const sqlMessage = `DELETE FROM message`;
        const sqlUserSection = `DELETE FROM userSection`;
        const sqlSection = `DELETE FROM section`;
        await connector.connect();
        await connector.query(sqlUpdateSection);
        await connector.query(sqlMessage);
        await connector.query(sqlUserSection);
        await connector.query(sqlSection);
        await connector.disconnect();
    });

    describe('save', () => {
        it('should save a new section', async () => {
            const section = new Section('Test Section', 0.5);

            await section.save();

            // Verify that the section is saved to the database
            const sql = `SELECT * FROM section`;
            await connector.connect();
            const rows = await connector.query(sql);
            await connector.disconnect();

            expect(rows).toHaveLength(1);
            expect(rows[0].name).toBe('Test Section');
            expect(rows[0].temperature).toBe(0.5);
            expect(rows[0].isActive).toBe(1); // Updated assertion
        });
    });

    describe('update', () => {
        it('should update an existing section', async () => {
            // Insert a section into the database
            const insertSql = `INSERT INTO section (name, temperature, isActive) VALUES (?, ?, ?)`;
            const insertValues = ['Test Section', 0.5, 1]; // Updated value
            await connector.connect();
            await connector.query(insertSql, insertValues);

            // Get the inserted section
            const selectSql = `SELECT * FROM section`;
            const rows = await connector.query(selectSql);
            const section = new Section(rows[0].name, rows[0].temperature, rows[0].idSection, rows[0].isActive);

            // Update the section
            section.name = 'Updated Section';
            section.temperature = 0.8;
            await section.update();

            // Verify that the section is updated in the database
            const updatedRows = await connector.query(selectSql);
            await connector.disconnect();

            expect(updatedRows).toHaveLength(1);
            expect(updatedRows[0].name).toBe('Updated Section');
            expect(updatedRows[0].temperature).toBe(0.8);
        });
    });

    describe('delete', () => {
        it('should set isActive to false for an existing section', async () => {
            // Insert a section into the database
            const insertSql = `INSERT INTO section (name, temperature, isActive) VALUES (?, ?, ?)`;
            const insertValues = ['Test Section', 0.5, 1]; // Updated value
            await connector.connect();
            await connector.query(insertSql, insertValues);

            // Get the inserted section
            const selectSql = `SELECT * FROM section`;
            const rows = await connector.query(selectSql);
            const section = new Section(rows[0].name, rows[0].temperature, rows[0].idSection, rows[0].isActive);

            // Delete the section
            await section.delete();

            // Verify that isActive is set to false in the database
            const deletedRows = await connector.query(selectSql);
            await connector.disconnect();

            expect(deletedRows).toHaveLength(1);
            expect(deletedRows[0].isActive).toBe(0); // Updated assertion
        });
    });

    describe('getById', () => {
        it('should retrieve a section by ID', async () => {
            // Insert a section into the database
            const insertSql = `INSERT INTO section (name, temperature, isActive) VALUES (?, ?, ?)`;
            const insertValues = ['Test Section', 0.5, 1]; // Updated value
            await connector.connect();
            await connector.query(insertSql, insertValues);

            // Get the inserted section
            const selectSql = `SELECT * FROM section`;
            const rows = await connector.query(selectSql);
            const sectionId = rows[0].idSection;

            // Retrieve the section by ID
            const section = await Section.getById(sectionId);

            expect(section).toBeInstanceOf(Section);
            expect(section?.name).toBe('Test Section');
            expect(section?.temperature).toBe(0.5);
            expect(section?.isActive).toBe(1); // Updated assertion
        });

        it('should return null for a non-existent section ID', async () => {
            const section = await Section.getById(999);

            expect(section).toBeNull();
        });
    });

    describe('getMessages', () => {
        it('should retrieve messages for the section', async () => {
            const section = new Section('Test Section', 0.5);
            await section.save();

            if (section.idSection === undefined) {
                throw new Error('Section ID is undefined');
            }

            const messageContent = 'Message 1';
            const message = new Message(messageContent, Type.PROMPT, section.idSection);
            await message.save();

            const messages = await section.getMessages();

            expect(messages).toHaveLength(1);
            expect(messages[0]).toBeInstanceOf(Message);
            expect(messages[0].content).toBe(messageContent);
        });
    });

    describe('getLastMessage', () => {
        it('should retrieve the last message for the section', async () => {
            const section = new Section('Test Section', 0.5);
            await section.save();

            if (section.idSection === undefined) {
                throw new Error('Section ID is undefined');
            }

            const messageContent1 = 'Message 1';
            const messageContent2 = 'Message 2';

            const message1 = new Message(messageContent1, Type.PROMPT, section.idSection);
            await message1.save();

            const message2 = new Message(messageContent2, Type.PROMPT, section.idSection);
            await message2.save();

            const lastMessage = await section.getLastMessage();

            expect(lastMessage).toBeInstanceOf(Message);
            expect(lastMessage?.content).toBe(messageContent2);
        });

        it('should return undefined if there are no messages for the section', async () => {
            const section = new Section('Test Section', 0.5);
            await section.save();

            const lastMessage = await section.getLastMessage();

            expect(lastMessage).toBeUndefined();
        });
    });
});
