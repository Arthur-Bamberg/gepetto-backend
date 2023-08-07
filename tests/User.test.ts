import { User } from '../models/User.class';
import { Section } from '../models/Section.class';
import { Connector } from '../utils/Connector';

describe('User', () => {
    let connector: Connector;

    beforeAll(() => {
        connector = new Connector();
    });

    beforeEach(async () => {
        const sqlUpdateSection = `UPDATE section SET FK_idLastMessage = NULL`;
        const sqlMessage = `DELETE FROM message`;
        const sqlUserSection = `DELETE FROM userSection`;
        const sqlSection = `DELETE FROM section`;
        const sqlUser = `DELETE FROM user`;
        await connector.connect();
        await connector.query(sqlUpdateSection);
        await connector.query(sqlMessage);
        await connector.query(sqlUserSection);
        await connector.query(sqlSection);
        await connector.query(sqlUser);
        await connector.disconnect();
    });

    describe('save', () => {
        it('deve salvar um novo usuário', async () => {
            const user = new User('João da Silva', 'joao@example.com', 'Senha*123');
            await user.save();

            const sql = `SELECT * FROM user`;
            await connector.connect();
            const rows = await connector.query(sql);
            await connector.disconnect();

            expect(rows).toHaveLength(1);
            expect(rows[0].name).toBe('João da Silva');
            expect(rows[0].email).toBe('joao@example.com');
        });
    });

    it('Deve gerar erro para email inválido', async () => {
        expect(() => new User('João da Silva', 'joao.com', 'Senha*123')).toThrowError('Invalid email format.');
    });

    it('Deve gerar erro para senha inválida', async () => {
        expect(()=> new User('João da Silva', 'joao@example.com', 'a123')).toThrowError('password must contain at least 8 characters, including uppercase, lowercase, digit, and special characters.');
    });

    describe('update', () => {
        it('deve atualizar um usuário existente', async () => {
            const insertSql = `INSERT INTO user (name, email, password, isActive) VALUES (?, ?, ?, ?)`;
            const insertValues = ['João da Silva', 'joao@example.com', 'senha123', true];
            await connector.connect();
            await connector.query(insertSql, insertValues);

            const selectSql = `SELECT * FROM user`;
            const rows = await connector.query(selectSql);
            const user = new User(rows[0].name, rows[0].email, '', rows[0].idUser, rows[0].isActive);

            user.name = 'Nome Atualizado';
            user.email = 'atualizado@example.com';
            await user.update();

            const updatedRows = await connector.query(selectSql);
            await connector.disconnect();

            expect(updatedRows).toHaveLength(1);
            expect(updatedRows[0].name).toBe('Nome Atualizado');
            expect(updatedRows[0].email).toBe('atualizado@example.com');
        });
    });

    describe('delete', () => {
        it('deve definir isActive como 0 para um usuário existente', async () => {
            const insertSql = `INSERT INTO user (name, email, password, isActive) VALUES (?, ?, ?, ?)`;
            const insertValues = ['João da Silva', 'joao@example.com', 'senha123', true];
            await connector.connect();
            await connector.query(insertSql, insertValues);

            const selectSql = `SELECT * FROM user`;
            const rows = await connector.query(selectSql);
            const user = new User(rows[0].name, rows[0].email, '', rows[0].idUser, rows[0].isActive);

            await user.delete();

            const deletedRows = await connector.query(selectSql);
            await connector.disconnect();

            expect(deletedRows).toHaveLength(1);
            expect(deletedRows[0].isActive).toBe(0);
        });
    });

    describe('getById', () => {
        it('deve recuperar um usuário por ID', async () => {
            const insertSql = `INSERT INTO user (name, email, password, isActive) VALUES (?, ?, ?, ?)`;
            const insertValues = ['João da Silva', 'joao@example.com', 'senha123', true];
            await connector.connect();
            await connector.query(insertSql, insertValues);

            const selectSql = `SELECT * FROM user`;
            const rows = await connector.query(selectSql);
            const user = await User.getById(rows[0].idUser);

            expect(user).toBeInstanceOf(User);
            expect(user?.name).toBe('João da Silva');
            expect(user?.email).toBe('joao@example.com');
        });

        it('deve retornar null para um ID de usuário inexistente', async () => {
            const user = await User.getById(999);

            expect(user).toBeNull();
        });
    });

    describe('addSection', () => {
        it('deve adicionar uma seção a um usuário', async () => {
            const user = new User('João da Silva', 'joao@example.com', 'Senha*123');
            await user.save();

            const section = new Section('Seção 1', 0.1);
            await section.save();

            await user.addSection(section);

            const sections = await user.getAllSections();

            if (sections !== null) {
                expect(sections).toHaveLength(1);
                expect(sections[0]).toBeInstanceOf(Section);
                expect(sections[0].name).toBe('Seção 1');
            }
        });
    });

    describe('getAllSections', () => {
        it('deve recuperar todas as seções de um usuário', async () => {
            const user = new User('João da Silva', 'joao@example.com', 'Senha*123');
            await user.save();

            const section1 = new Section('Seção 1', 0.1);
            const section2 = new Section('Seção 2', 0.2);
            await section1.save();
            await section2.save();

            await user.addSection(section1);
            await user.addSection(section2);

            const sections = await user.getAllSections();

            expect(sections).toHaveLength(2);

            if (sections !== null) {
                expect(sections[0]).toBeInstanceOf(Section);
                expect(sections[0].name).toBe('Seção 1');
                expect(sections[1]).toBeInstanceOf(Section);
                expect(sections[1].name).toBe('Seção 2');
            }
        });
    });

    describe('removeSection', () => {
        it('deve remover uma seção de um usuário', async () => {
            const user = new User('João da Silva', 'joao@example.com', 'Senha*123');
            await user.save();

            const section1 = new Section('Seção 1', 0.1);
            const section2 = new Section('Seção 2', 0.2);
            await section1.save();
            await section2.save();

            await user.addSection(section1);
            await user.addSection(section2);

            await user.removeSection(section1);

            const sections = await user.getAllSections();

            if (sections !== null) {
                expect(sections).toHaveLength(1);
                expect(sections[0]).toBeInstanceOf(Section);
                expect(sections[0].name).toBe('Seção 2');
            }
        });
    });
});
