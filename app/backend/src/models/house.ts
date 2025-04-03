import db from '../config/database.js';

class House {
    public id?: number;
    public name?: string;
    public userId?: number;

    constructor(id?: number, name?: string, userId?: number) {
        this.id = id;
        this.name = name;
        this.userId = userId;
    }

    static async createTable() {
        const client = await db.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS houses (
                                                      id SERIAL PRIMARY KEY,
                                                      name TEXT NOT NULL,
                                                      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
                    )
            `);
        } finally {
            client.release();
        }
    }

    static async createHouse(name: string, userId: number): Promise<House> {
        const client = await db.connect();
        try {
            const result = await client.query(
                'INSERT INTO houses (name, user_id) VALUES ($1, $2) RETURNING id, name, user_id',
                [name, userId]
            );
            const { id, name: returnedName, user_id } = result.rows[0];
            return new House(id, returnedName, user_id);
        } finally {
            client.release();
        }
    }

    static async findByUserId(userId: number): Promise<House[]> {
        const client = await db.connect();
        try {
            const result = await client.query('SELECT * FROM houses WHERE user_id = $1', [userId]);
            return result.rows.map(row => new House(row.id, row.name, row.user_id));
        } finally {
            client.release();
        }
    }

    static async findById(id: number): Promise<House | null> {
        const client = await db.connect();
        try {
            const result = await client.query('SELECT * FROM houses WHERE id = $1', [id]);
            if (result.rows.length === 0) {
                return null;
            }
            const row = result.rows[0];
            return new House(row.id, row.name, row.user_id);
        } finally {
            client.release();
        }
    }

    static async updateHouse(id: number, name: string): Promise<House> {
        const client = await db.connect();
        try {
            const result = await client.query(
                'UPDATE houses SET name = $1 WHERE id = $2 RETURNING id, name, user_id',
                [name, id]
            );
            const { id: returnedId, name: returnedName, user_id } = result.rows[0];
            return new House(returnedId, returnedName, user_id);
        } finally {
            client.release();
        }
    }

    static async deleteHouse(id: number): Promise<void> {
        const client = await db.connect();
        try {
            await client.query('DELETE FROM houses WHERE id = $1', [id]);
        } finally {
            client.release();
        }
    }
}

export default House;