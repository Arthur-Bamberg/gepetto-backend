import { Connector } from '../utils/Connector';

describe('Connector', () => {
    let connector: Connector;

    beforeAll(async () => {
        connector = new Connector();
        await connector.connect();
    });

    afterAll(async () => {
        await connector.disconnect();
    });

    it('Deve conectar ao banco', async () => {
        await expect(connector.connect()).resolves.toBeUndefined();
    });

    it('Deve pegar o último id inserido', async () => {
        await connector.query('DELETE FROM user');

        const sql = `INSERT INTO user (name, email, password) VALUES (?, ?, ?)`;
        await connector.query(sql, [
            'John Doe',
            'jhon.doe@email.com',
            'Pass*123'
        ]);

        const lastInsertId = await connector.getLastInsertedId();

        expect(lastInsertId).not.toBe(0);
    });

    it('Deve buscar os usuários', async () => {
        await connector.query('DELETE FROM user');

        const sql = `INSERT INTO user (idUser, name, email, password) VALUES (100, ?, ?, ?)`;
        await connector.query(sql, [
            'John Doe',
            'jhon.doe@email.com',
            'Pass*123'
        ]);

        const rows = await connector.query('SELECT * FROM user');
        expect(rows).toHaveLength(1);
        expect(rows[0]).toEqual({
            idUser: 100,
            name: 'John Doe',
            email: 'jhon.doe@email.com',
            password: 'Pass*123',
            isAdmin: 0,
            isActive: 1
        });
    });

    it('Deve desconectar do banco', async () => {
        await expect(connector.disconnect()).resolves.toBeUndefined();
    });
});
