"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const Connector_1 = require("../utils/Connector");
class User {
    constructor(idUser, name, email, password, isActive) {
        this._idUser = idUser;
        this._name = name;
        this._email = email;
        this._password = password;
        this._isActive = isActive;
        this._connector = new Connector_1.Connector();
    }
    get idUser() {
        return this._idUser;
    }
    set idUser(value) {
        if (value <= 0) {
            throw new Error('idUser must be a positive number.');
        }
        this._idUser = value;
    }
    get name() {
        return this._name;
    }
    set name(value) {
        if (!value || value.trim().length === 0) {
            throw new Error('name cannot be empty.');
        }
        this._name = value;
    }
    get email() {
        return this._email;
    }
    set email(value) {
        if (!value || value.trim().length === 0) {
            throw new Error('email cannot be empty.');
        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
            throw new Error('Invalid email format.');
        }
        this._email = value;
    }
    get password() {
        return this._password;
    }
    set password(value) {
        if (!value || value.trim().length === 0) {
            throw new Error('password cannot be empty.');
        }
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordPattern.test(value)) {
            throw new Error('password must contain at least 8 characters, including uppercase, lowercase, digit, and special characters.');
        }
        this._password = value;
    }
    get isActive() {
        return this._isActive;
    }
    set isActive(value) {
        this._isActive = value;
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
            INSERT INTO user (idUser, name, email, password, isActive)
            VALUES (?, ?, ?, ?, ?)
        `;
            const values = [this._idUser, this._name, this._email, this._password, this._isActive];
            try {
                yield this._connector.connect();
                yield this._connector.query(sql, values);
                console.log('User saved successfully.');
            }
            catch (err) {
                console.error('Error saving user:', err);
            }
            finally {
                yield this._connector.disconnect();
            }
        });
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
            UPDATE user
            SET name = ?, email = ?, password = ?, isActive = ?
            WHERE idUser = ?
        `;
            const values = [this._name, this._email, this._password, this._isActive, this._idUser];
            try {
                yield this._connector.connect();
                yield this._connector.query(sql, values);
                console.log('User updated successfully.');
            }
            catch (err) {
                console.error('Error updating user:', err);
            }
            finally {
                yield this._connector.disconnect();
            }
        });
    }
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
            DELETE FROM user
            WHERE idUser = ?
        `;
            const values = [this._idUser];
            try {
                yield this._connector.connect();
                yield this._connector.query(sql, values);
                console.log('User deleted successfully.');
            }
            catch (err) {
                console.error('Error deleting user:', err);
            }
            finally {
                yield this._connector.disconnect();
            }
        });
    }
    static getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
            SELECT *
            FROM user
            WHERE idUser = ?
        `;
            const values = [id];
            const connector = new Connector_1.Connector();
            try {
                yield connector.connect();
                const rows = yield connector.query(sql, values);
                if (rows.length === 0) {
                    return null;
                }
                const row = rows[0];
                const user = new User(row.idUser, row.name, row.email, row.password, row.isActive);
                return user;
            }
            catch (err) {
                console.error('Error fetching user by ID:', err);
                return null;
            }
            finally {
                yield connector.disconnect();
            }
        });
    }
    static getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
            SELECT *
            FROM user
        `;
            const connector = new Connector_1.Connector();
            try {
                yield connector.connect();
                const rows = yield connector.query(sql);
                const users = rows.map((row) => new User(row.idUser, row.name, row.email, row.password, row.isActive));
                return users;
            }
            catch (err) {
                console.error('Error fetching all users:', err);
                return [];
            }
            finally {
                yield connector.disconnect();
            }
        });
    }
}
exports.User = User;
function exampleUsage() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Create a new user
            const newUser = new User(1, 'John Doe', 'johndoe@example.com', 'Password123!', true);
            yield newUser.save();
            // Update user details
            newUser.name = 'John Smith';
            yield newUser.update();
            // Fetch a user by ID
            const fetchedUser = yield User.getById(newUser.idUser);
            console.log('Fetched user:', fetchedUser);
            // Fetch all users
            const allUsers = yield User.getAll();
            console.log('All users:', allUsers);
            // Delete the user
            yield newUser.delete();
        }
        catch (err) {
            console.error('Error:', err);
        }
    });
}
exampleUsage();
//# sourceMappingURL=User.class.js.map