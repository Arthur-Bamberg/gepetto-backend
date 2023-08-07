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

    it('Executar uma inserção', async () => {
        await connector.query('DELETE user WHERE idUser = 100');
        const sql = `INSERT INTO user (idUser, name, email, password) VALUES (100, ?, ?, ?)`;
        await connector.query(sql, [
            'John Doe',
            'jhon.doe@email.com',
            'Pass*123'
        ]);
    });

    it('Deve pegar o último id inserido', async () => {
        const lastInsertId = await connector.getLastInsertedId();
        expect(lastInsertId).toBe(100);
    });

    it('Deve buscar os usuários', async () => {
        await connector.query('DELETE user WHERE idUser != 100');
        const rows = await connector.query('SELECT * FROM user');
        console.log(rows);
        expect(rows).toHaveLength(1);
    });

    it('Deve desconectar do banco', async () => {
        await expect(connector.disconnect()).resolves.toBeUndefined();
    });
});
