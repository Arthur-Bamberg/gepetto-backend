import { Connector } from '../utils/Connector';
import { Section } from '../models/Section.class';
import { Message, Type } from '../models/Message.class';

describe('Section', () => {
    let connector: Connector;

    beforeAll(() => {
        connector = new Connector();
    });

    beforeEach(async () => {
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
        it('Deve salvar uma nova seção', async () => {
            const section = new Section('Test Section', 0.5);

            await section.save();

            const sql = `SELECT * FROM section`;
            await connector.connect();
            const rows = await connector.query(sql);
            await connector.disconnect();

            expect(rows).toHaveLength(1);
            expect(rows[0].name).toBe('Test Section');
            expect(rows[0].temperature).toBe(0.5);
            expect(rows[0].isActive).toBe(1); 
        });
    });

    describe('update', () => {
        it('Deve atualizar uma seção existente', async () => {
            
            const insertSql = `INSERT INTO section (name, temperature, isActive) VALUES (?, ?, ?)`;
            const insertValues = ['Test Section', 0.5, 1]; 
            await connector.connect();
            await connector.query(insertSql, insertValues);

            const selectSql = `SELECT * FROM section`;
            const rows = await connector.query(selectSql);
            const section = new Section(rows[0].name, rows[0].temperature, rows[0].idSection, rows[0].isActive);

            section.name = 'Updated Section';
            section.temperature = 0.8;
            await section.update();

            const updatedRows = await connector.query(selectSql);
            await connector.disconnect();

            expect(updatedRows).toHaveLength(1);
            expect(updatedRows[0].name).toBe('Updated Section');
            expect(updatedRows[0].temperature).toBe(0.8);
        });
    });

    describe('delete', () => {
        it('Deve deixar o isActive de uma seção como falsa', async () => {
            
            const insertSql = `INSERT INTO section (name, temperature, isActive) VALUES (?, ?, ?)`;
            const insertValues = ['Test Section', 0.5, 1]; 
            await connector.connect();
            await connector.query(insertSql, insertValues);

            const selectSql = `SELECT * FROM section`;
            const rows = await connector.query(selectSql);
            const section = new Section(rows[0].name, rows[0].temperature, rows[0].idSection, rows[0].isActive);

            await section.delete();

            const deletedRows = await connector.query(selectSql);
            await connector.disconnect();

            expect(deletedRows).toHaveLength(1);
            expect(deletedRows[0].isActive).toBe(0); 
        });
    });

    describe('getById', () => {
        it('Deve retornar uma seção pelo ID', async () => {
            
            const insertSql = `INSERT INTO section (name, temperature, isActive) VALUES (?, ?, ?)`;
            const insertValues = ['Test Section', 0.5, 1]; 
            await connector.connect();
            await connector.query(insertSql, insertValues);

            const selectSql = `SELECT * FROM section`;
            const rows = await connector.query(selectSql);
            const sectionId = rows[0].idSection;

            const section = await Section.getById(sectionId);

            expect(section).toBeInstanceOf(Section);
            expect(section?.name).toBe('Test Section');
            expect(section?.temperature).toBe(0.5);
            expect(section?.isActive).toBe(1); 
        });

        it('Deve retornar null para uma seção que não existe no ID', async () => {
            const section = await Section.getById(999);

            expect(section).toBeNull();
        });
    });

    describe('getMessages', () => {
        it('Deve retornar as mensagens pela seção', async () => {
            const section = new Section('Test Section', 0.5);
            await section.save();

            if (section.idSection === undefined) {
                throw new Error('Section ID is undefined');
            }

            const messageContent = 'Message 1';
            const message = new Message(messageContent, Type.PROMPT, section.idSection);
            await message.save();

            const messages = await section.getMessages();

            if(messages === null) {
                throw new Error('Messages are null');
            }

            expect(messages).toHaveLength(1);

            expect(messages[0].content).toEqual(messageContent);
            expect(messages[0].type).toEqual(Type.PROMPT);
            expect(messages[0].idSection).toEqual(section.idSection);
            expect(messages[0].isAlternativeAnswer).toEqual(0);
            expect(messages[0].isActive).toEqual(1);
        });
    });

    describe('Busca a última mensagem', () => {
        it('Deve retornar a última mensagem da seção', async () => {
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

            expect(lastMessage).toBeNull();
        });
    });
});
