import pool from '../config/database';

class User {
    static async createTable(): Promise<void> {
        const client = await pool.connect();
        try {
            const query = `
                CREATE TABLE IF NOT EXISTS users (
                                                     id SERIAL PRIMARY KEY,
                                                     username VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL
                    );
            `;
            await client.query(query);
        } finally {
            client.release();
        }
    }

    static async findByUsername(username: string): Promise<any | null> {
        const client = await pool.connect();
        try {
            const query = 'SELECT * FROM users WHERE username = $1';
            const result = await client.query(query, [username]);
            return result.rows.length > 0 ? result.rows[0] : null;
        } finally {
            client.release();
        }
    }

    static async createUser(username: string, password: string): Promise<any> {
        const client = await pool.connect();
        try {
            const query = 'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *';
            const result = await client.query(query, [username, password]);
            return result.rows[0];
        } finally {
            client.release();
        }
    }
}

export default User;