import { Pool, PoolConnection, createPool, QueryError, RowDataPacket } from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

export class Connector {
    private static staticConnector: Connector|null = null;
    private pool: Pool|null = null; 
    private connection: PoolConnection|null = null;
    private lastInsertedId: number = 0;

    constructor() {
        if(Connector.staticConnector) {
            return Connector.staticConnector;

        } else {
            this.pool = createPool({
                host: process.env.HOST,
                user: process.env.USER,
                password: process.env.PASSWORD,
                database: process.env.DATABASE,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                enableKeepAlive: true,
                keepAliveInitialDelay: 0
            });

            Connector.staticConnector = this;
        }
    }

    public connect(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if(this.connection) {
                resolve();
                return;
            }

            this.pool?.getConnection((err: any, connection: PoolConnection) => {
                if (err) {
                    reject(err);
                    return;
                }

                this.connection = connection;
                resolve();
            });
        });
    }

    public async beginTransaction(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection?.beginTransaction((err: object | null) => {
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
            this.connection?.commit((err: object | null) => {
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
            this.connection?.rollback((err: object | null) => {
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
            this.connection?.query(sql, values, (err: QueryError | null, rows: any) => {
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

    public static async closeConnection(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if(!Connector.staticConnector?.connection) {
                resolve();
                return;
            }

            Connector.staticConnector.pool?.releaseConnection(Connector.staticConnector.connection);

            Connector.staticConnector.connection.release();

            Connector.staticConnector.connection = null;

            resolve();
        });
    }
}
