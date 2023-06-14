"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connector = void 0;
const mysql2_1 = require("mysql2");
class Connector {
    constructor() {
        this.connection = (0, mysql2_1.createConnection)({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'gepetto'
        });
    }
    connect() {
        return new Promise((resolve, reject) => {
            this.connection.connect((err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    query(sql, values) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, values, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    }
    disconnect() {
        return new Promise((resolve, reject) => {
            this.connection.end((err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
}
exports.Connector = Connector;
//# sourceMappingURL=Connector.js.map