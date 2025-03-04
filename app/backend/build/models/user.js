var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import pool from '../config/database.js'; //added .js
class User {
    static createTable() {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield pool.connect();
            try {
                const query = `
                CREATE TABLE IF NOT EXISTS users (
                                                     id SERIAL PRIMARY KEY,
                                                     username VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL
                    );
            `;
                yield client.query(query);
            }
            finally {
                client.release();
            }
        });
    }
    static findByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield pool.connect();
            try {
                const query = 'SELECT * FROM users WHERE username = $1';
                const result = yield client.query(query, [username]);
                return result.rows.length > 0 ? result.rows[0] : null;
            }
            finally {
                client.release();
            }
        });
    }
    static createUser(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield pool.connect();
            try {
                const query = 'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *';
                const result = yield client.query(query, [username, password]);
                return result.rows[0];
            }
            finally {
                client.release();
            }
        });
    }
}
export default User;
