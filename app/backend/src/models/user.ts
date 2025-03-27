import db from '../config/database.js';
import bcrypt from 'bcrypt';

class User {
    public id?: number;
    public username?: string;
    public password?: string;
    public email?: string; //add email

    constructor(id?: number, username?: string, password?: string, email?: string) {//add email
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;//add email
    }
    static async createTable() {
        const client = await db.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    email TEXT UNIQUE
                )
            `);//add email column
        } finally {
            client.release();
        }
    }

    static async createUser(username: string, password: string, email: string): Promise<User> {//add email
        const client = await db.connect();
        try {
            const result = await client.query(
                'INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING id, username, email',//add email
                [username, password, email]//add email
            );
            const { id, username: returnedUsername, email: returnedEmail } = result.rows[0];//add email
            return new User(id, returnedUsername, undefined, returnedEmail);//add email
        } finally {
            client.release();
        }
    }

    static async findByUsername(username: string): Promise<User | null> {
        const client = await db.connect();
        try {
            const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
            if (result.rows.length === 0) {
                return null;
            }
            const { id, username: returnedUsername, password, email } = result.rows[0];//add email
            return new User(id, returnedUsername, password, email);//add email
        } finally {
            client.release();
        }
    }
    static async findById(id: number): Promise<User | null> { // add this function
        const client = await db.connect();
        try {
            const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
            if (result.rows.length === 0) {
                return null;
            }
            const { id: returnedId, username, password, email } = result.rows[0];//add email
            return new User(returnedId, username, password, email);//add email
        } finally {
            client.release();
        }
    }

    static async updateUser(id: number, username?: string, password?: string, email?: string): Promise<User | null> { // add this function, add email
        const client = await db.connect();
        try {
            let query = 'UPDATE users SET ';
            const values: any[] = [];
            let paramCount = 1;
            if (username) {
                query += `username = $${paramCount}, `;
                values.push(username);
                paramCount++;
            }
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                query += `password = $${paramCount}, `;
                values.push(hashedPassword);
                paramCount++;
            }
            if (email) {//add email
                query += `email = $${paramCount}, `;
                values.push(email);
                paramCount++;
            }
            query = query.slice(0, -2); // Remove the trailing comma and space
            query += ` WHERE id = $${paramCount} RETURNING *`;
            values.push(id);

            const result = await client.query(query, values);
            if (result.rows.length === 0) {
                return null;
            }
            const { id: returnedId, username: returnedUsername, password: returnedPassword, email: returnedEmail } = result.rows[0]; //add email
            return new User(returnedId, returnedUsername, returnedPassword, returnedEmail);//add email
        } finally {
            client.release();
        }
    }
}

export default User;