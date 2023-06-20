import { Connector } from '../utils/Connector';
import { Section } from '../models/Section.class';
import { Message } from '../models/Message.class';

describe('Section', () => {
    let connector: Connector;

    beforeAll(() => {
        connector = new Connector();
    });

    beforeEach(async () => {
        // Ensure the section table is empty before each test
        const sqlMessage = `DELETE FROM message`;
        const sqlUserSection = `DELETE FROM userSection`;
        const sqlSection = `DELETE FROM section`;
        await connector.connect();
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
            // Insert a section into the database
            const insertSql = `INSERT INTO section (name, temperature, isActive) VALUES (?, ?, ?)`;
            const insertValues = ['Test Section', 0.5, 1];
            await connector.connect();
            await connector.query(insertSql, insertValues);

            // Insert some messages for the section
            const sectionId = await connector.getLastInsertedId(); // Assuming getLastInsertId() returns the ID of the last inserted row

            console.log('section bolas', sectionId);

            const messageSql = `INSERT INTO message (FK_idSection, content) VALUES (?, ?)`;
            const messageValues = [sectionId, 'Message 1'];

            await connector.query(messageSql, messageValues);

            console.log(messageValues);

            // Get the section instance
            const section = new Section('Test Section', 0.5, sectionId, true);

            console.log(section);

            // Retrieve messages for the section
            const messages = await section.getMessages();

            console.log(messages);

            expect(messages).toHaveLength(1);
            expect(messages[0]).toBeInstanceOf(Message);
            expect(messages[0].content).toBe('Message 1');
        });
    });
});
