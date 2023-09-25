import { createConnection, QueryError, RowDataPacket } from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

export class Connector {
    private connection: any;
    private isConnected: boolean = false;

    constructor() {
        this.connection = createConnection({
            host: process.env.HOST,
            user: process.env.USER,
            password: process.env.PASSWORD,
            database: process.env.DATABASE
        });
    }

    public connect(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if(!this.isConnected) {
                this.connection.connect((err: QueryError) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    this.isConnected = true;
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    public async beginTransaction(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection.beginTransaction((err: object) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    public async commit(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection.commit((err: object) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    public async rollback(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection.rollback((err: object) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
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
            if(this.isConnected) {
                this.connection.end((err: QueryError) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    this.isConnected = false;
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}
