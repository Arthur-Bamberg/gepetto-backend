import { User } from '../models/User.class';
import { Connector } from '../utils/Connector';

describe('User', () => {
    let connector: Connector;

    beforeAll(() => {
        connector = new Connector();
    });

    beforeEach(async () => {
        // Ensure the user table is empty before each test
        const sql = `DELETE FROM user`;
        await connector.connect();
        await connector.query(sql);
        await connector.disconnect();
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

    describe('getAll', () => {
        it('should retrieve all active users', async () => {
            // Insert multiple users into the database
            const insertSql = `INSERT INTO user (name, email, password, isActive) VALUES (?, ?, ?, ?)`;
            const insertValues = [
                ['John Doe', 'john@example.com', 'password123', true],
                ['Jane Smith', 'jane@example.com', 'password456', true],
                ['Alice Johnson', 'alice@example.com', 'password789', false],
            ];
            await connector.connect();
            await Promise.all(insertValues.map((values) => connector.query(insertSql, values)));

            // Get all active users
            const users = await User.getAll();

            expect(users).toHaveLength(2);
            expect(users[0].name).toBe('John Doe');
            expect(users[1].name).toBe('Jane Smith');
        });

        it('should return an empty array if no active users exist', async () => {
            const users = await User.getAll();

            expect(users).toHaveLength(0);
        });
    });
});
