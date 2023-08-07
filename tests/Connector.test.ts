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
        await connector.query('DELETE FROM test');

        const sql = `INSERT INTO test () VALUES ()`;
        await connector.query(sql);

        const lastInsertId = await connector.getLastInsertedId();

        expect(lastInsertId).not.toBe(0);
    });

    it('Deve retornar 0 para o último id inserido', async () => {
        await connector.query('DELETE FROM test');

        const lastInsertId = await connector.getLastInsertedId();

        expect(lastInsertId).not.toBe(0);
    });

    it('Deve buscar os usuários', async () => {
        await connector.query('DELETE FROM test');

        const sql = `INSERT INTO test (idTest) VALUES (100)`;
        await connector.query(sql);

        const rows = await connector.query('SELECT * FROM test');
        expect(rows).toHaveLength(1);
        expect(rows[0].idTest).toBe(100);
    });

    it('Deve desconectar do banco', async () => {
        await expect(connector.disconnect()).resolves.toBeUndefined();
    });
});
