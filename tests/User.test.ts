import { User } from '../models/User.class';
import { Section } from '../models/Section.class';
import { Connector } from '../utils/Connector';

describe('User', () => {
    let connector: Connector;

    beforeAll(() => {
        connector = new Connector();
        cleanDatabase();
    });

    beforeEach(async () => {
        //Ensure the user table is empty before each test
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

    afterAll(async () => {
        cleanDatabase();
    });

    describe('save', () => {
        it('should save a new user', async () => {
            const user = new User('John Doe', 'john@example.com', 'password123');
            await user.save();

            // Verify that the user is saved to the database
            const sql = `SELECT * FROM user`;
            await connector.connect();
            const rows = await connector.query(sql);
            await connector.disconnect();

            expect(rows).toHaveLength(1);
            expect(rows[0].name).toBe('John Doe');
            expect(rows[0].email).toBe('john@example.com');
        });
    });

    describe('update', () => {
        it('should update an existing user', async () => {
            // Insert a user into the database
            const insertSql = `INSERT INTO user (name, email, password, isActive) VALUES (?, ?, ?, ?)`;
            const insertValues = ['John Doe', 'john@example.com', 'password123', true];
            await connector.connect();
            await connector.query(insertSql, insertValues);

            // Get the inserted user
            const selectSql = `SELECT * FROM user`;
            const rows = await connector.query(selectSql);
            const user = new User(rows[0].name, rows[0].email, '', rows[0].idUser, rows[0].isActive);

            // Update the user
            user.name = 'Updated Name';
            user.email = 'updated@example.com';
            await user.update();

            // Verify that the user is updated in the database
            const updatedRows = await connector.query(selectSql);
            await connector.disconnect();

            expect(updatedRows).toHaveLength(1);
            expect(updatedRows[0].name).toBe('Updated Name');
            expect(updatedRows[0].email).toBe('updated@example.com');
        });
    });

    describe('delete', () => {
        it('should set isActive to 0 for an existing user', async () => {
            // Insert a user into the database
            const insertSql = `INSERT INTO user (name, email, password, isActive) VALUES (?, ?, ?, ?)`;
            const insertValues = ['John Doe', 'john@example.com', 'password123', true];
            await connector.connect();
            await connector.query(insertSql, insertValues);

            // Get the inserted user
            const selectSql = `SELECT * FROM user`;
            const rows = await connector.query(selectSql);
            const user = new User(rows[0].name, rows[0].email, '', rows[0].idUser, rows[0].isActive);

            // Delete the user
            await user.delete();

            // Verify that isActive is set to 0 in the database
            const deletedRows = await connector.query(selectSql);
            await connector.disconnect();

            expect(deletedRows).toHaveLength(1);
            expect(deletedRows[0].isActive).toBe(0);
        });
    });

    describe('getById', () => {
        it('should retrieve a user by ID', async () => {
            // Insert a user into the database
            const insertSql = `INSERT INTO user (name, email, password, isActive) VALUES (?, ?, ?, ?)`;
            const insertValues = ['John Doe', 'john@example.com', 'password123', true];
            await connector.connect();
            await connector.query(insertSql, insertValues);

            // Get the inserted user
            const selectSql = `SELECT * FROM user`;
            const rows = await connector.query(selectSql);
            const user = await User.getById(rows[0].idUser);

            expect(user).toBeInstanceOf(User);
            expect(user?.name).toBe('John Doe');
            expect(user?.email).toBe('john@example.com');
        });

        it('should return null for a non-existent user ID', async () => {
            const user = await User.getById(999);

            expect(user).toBeNull();
        });
    });

    describe('addSection', () => {
        it('should add a section to a user', async () => {
            const user = new User('John Doe', 'john@example.com', 'password123');
            await user.save();

            const section = new Section('Section 1', 0.1);
            await section.save();

            await user.addSection(section);

            const sections = await user.getAllSections();

            if (sections !== null) {
                expect(sections).toHaveLength(1);
                expect(sections[0]).toBeInstanceOf(Section);
                expect(sections[0].name).toBe('Section 1');    
            }
        });
    });

    describe('getAllSections', () => {
        it('should retrieve all sections for a user', async () => {
            const user = new User('John Doe', 'john@example.com', 'password123');
            await user.save();

            const section1 = new Section('Section 1', 0.1);
            const section2 = new Section('Section 2', 0.2);
            await section1.save();
            await section2.save();

            await user.addSection(section1);
            await user.addSection(section2);

            const sections = await user.getAllSections();

            expect(sections).toHaveLength(2);

            if(sections !== null) {
                expect(sections[0]).toBeInstanceOf(Section);
                expect(sections[0].name).toBe('Section 1');
                expect(sections[1]).toBeInstanceOf(Section);
                expect(sections[1].name).toBe('Section 2');
            }
        });
    });

    describe('removeSection', () => {
        it('should remove a section from a user', async () => {
            const user = new User('John Doe', 'john@example.com', 'password123');
            await user.save();

            const section1 = new Section('Section 1', 0.1);
            const section2 = new Section('Section 2', 0.2);
            await section1.save();
            await section2.save();

            await user.addSection(section1);
            await user.addSection(section2);

            await user.removeSection(section1);

            const sections = await user.getAllSections();

            if(sections !== null) {
                expect(sections).toHaveLength(1);
                expect(sections[0]).toBeInstanceOf(Section);
                expect(sections[0].name).toBe('Section 2');
            }
        });
    });
});
