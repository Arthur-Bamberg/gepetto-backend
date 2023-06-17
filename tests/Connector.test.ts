import { Connector } from '../utils/Connector';

describe('Connector', () => {
    let connector: Connector;

    beforeAll(() => {
        connector = new Connector();
    });

    afterAll(async () => {
        await connector.disconnect();
    });

    it('should connect to the database', async () => {
        await expect(connector.connect()).resolves.toBeUndefined();
    });

    it('should execute a query', async () => {
        const rows = await connector.query('SELECT * FROM user');
        expect(rows).toHaveLength(1);
    });

    it('should disconnect from the database', async () => {
        await expect(connector.disconnect()).resolves.toBeUndefined();
    });
});
