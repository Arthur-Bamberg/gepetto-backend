import { createConnection, QueryError, RowDataPacket } from 'mysql2';

export class Connector {
    private connection: any;

    constructor() {
        this.connection = createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'gepetto'
        });
    }

    public connect(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.connection.connect((err: QueryError) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }

    public query(sql: string, values?: any[]): Promise<RowDataPacket[]> {
        return new Promise<RowDataPacket[]>((resolve, reject) => {
            this.connection.query(sql, values, (err: QueryError, rows: RowDataPacket[]) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    }

    public getLastInsertedId(): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.connection.query('SELECT LAST_INSERT_ID()', (err: QueryError, rows: RowDataPacket[]) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (rows.length === 0) {
                    resolve(0);
                } else {
                    const lastInsertId = rows[0]['LAST_INSERT_ID()'];
                    resolve(lastInsertId);
                }
            });
        });
    }

    public disconnect(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.connection.state === 'disconnected' || !this.connection._protocol) {
                resolve();
                return;
            }

            this.connection.end((err: QueryError) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
}
