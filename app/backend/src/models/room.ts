import db from '../config/database.js';

class Room {
    public id?: number;
    public name?: string;
    public houseId?: number;

    constructor(id?: number, name?: string, houseId?: number) {
        this.id = id;
        this.name = name;
        this.houseId = houseId;
    }

    static async createTable() {
        const client = await db.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS rooms (
                                                     id SERIAL PRIMARY KEY,
                                                     name TEXT NOT NULL,
                                                     house_id INTEGER REFERENCES houses(id) ON DELETE CASCADE
                    )
            `);
        } finally {
            client.release();
        }
    }

    static async createRoom(name: string, houseId: number): Promise<Room> {
        const client = await db.connect();
        try {
            const result = await client.query(
                'INSERT INTO rooms (name, house_id) VALUES ($1, $2) RETURNING id, name, house_id',
                [name, houseId]
            );
            const { id, name: returnedName, house_id } = result.rows[0];
            return new Room(id, returnedName, house_id);
        } finally {
            client.release();
        }
    }

    static async findByHouseId(houseId: number): Promise<Room[]> {
        const client = await db.connect();
        try {
            const result = await client.query('SELECT * FROM rooms WHERE house_id = $1', [houseId]);
            return result.rows.map(row => new Room(row.id, row.name, row.house_id));
        } finally {
            client.release();
        }
    }

    static async findById(id: number): Promise<Room | null> {
        const client = await db.connect();
        try {
            const result = await client.query('SELECT * FROM rooms WHERE id = $1', [id]);
            if (result.rows.length === 0) {
                return null;
            }
            const row = result.rows[0];
            return new Room(row.id, row.name, row.house_id);
        } finally {
            client.release();
        }
    }

    static async updateRoom(id: number, name: string): Promise<Room> {
        const client = await db.connect();
        try {
            const result = await client.query(
                'UPDATE rooms SET name = $1 WHERE id = $2 RETURNING id, name, house_id',
                [name, id]
            );
            const { id: returnedId, name: returnedName, house_id } = result.rows[0];
            return new Room(returnedId, returnedName, house_id);
        } finally {
            client.release();
        }
    }

    static async deleteRoom(id: number): Promise<void> {
        const client = await db.connect();
        try {
            await client.query('DELETE FROM rooms WHERE id = $1', [id]);
        } finally {
            client.release();
        }
    }
}

export default Room;