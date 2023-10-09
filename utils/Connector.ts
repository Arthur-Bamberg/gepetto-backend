import { createConnection, QueryError, RowDataPacket } from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

export class Connector {
    private static staticConnection: any;
    private connection: any;
    private isConnected: boolean = false;
    private lastInsertedId: number = 0;

    constructor() {
        if(Connector.staticConnection) {
            this.connection = Connector.staticConnection;

        } else {
            this.connection = createConnection({
                host: process.env.HOST,
                user: process.env.USER,
                password: process.env.PASSWORD,
                database: process.env.DATABASE
            });

            Connector.staticConnection = this.connection;
        }
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
            this.connection.query(sql, values, (err: QueryError, rows: any) => {
                if (err) {
                    reject(err);
                    return;
                }

                if(rows.insertId) {
                    this.lastInsertedId = rows.insertId;
                }

                resolve(rows);
            });
        });
    }

    public getLastInsertedId(): number {
        return this.lastInsertedId;
    }

    public static disconnect(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            Connector.staticConnection.end((err: QueryError) => {
                if (err) {
                    reject(err);
                    return;
                }

                Connector.staticConnection = null;

                resolve();
            });
        });
    }
}
