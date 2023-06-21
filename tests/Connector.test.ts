import { Connector } from '../utils/Connector';
import { User } from '../models/User.class';

describe('Connector', () => {
    let connector: Connector;

    beforeAll(async () => {
        connector = new Connector();
        const sqlUser = `DELETE FROM user`;
        await connector.connect();
        await connector.query(sqlUser);
    });

    afterAll(async () => {
        await connector.disconnect();
    });

    it('should connect to the database', async () => {
        await expect(connector.connect()).resolves.toBeUndefined();
    });

    it('should execute a query', async () => {
        const user = new User('John Doe', 'john@example.com', 'password123');
        await user.save();

        const rows = await connector.query('SELECT * FROM user');
        expect(rows).toHaveLength(1);
    });

    it('should get the last inserted ID', async () => {
        const lastInsertId = await connector.getLastInsertedId();
        expect(lastInsertId).toBe(0);
    });

    it('should begin a transaction', async () => {
        await expect(connector.beginTransaction()).resolves.toBeUndefined();
    });

    it('should execute a transactional query', async () => {
        const sql = `INSERT INTO user (name) VALUES (?)`;
        const values = ['John Doe'];
        await connector.query(sql, values);
    });

    it('should commit the transaction', async () => {
        await expect(connector.commit()).resolves.toBeUndefined();
    });

    it('should disconnect from the database', async () => {
        await expect(connector.disconnect()).resolves.toBeUndefined();
    });
});
