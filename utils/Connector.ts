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

    public disconnect(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
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
