import db from '../config/database.js';

class Appliance {
    public id?: number;
    public name?: string;
    public roomId?: number;

    constructor(id?: number, name?: string, roomId?: number) {
        this.id = id;
        this.name = name;
        this.roomId = roomId;
    }

    static async createTable() {
        const client = await db.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS appliances (
                                                          id SERIAL PRIMARY KEY,
                                                          name TEXT NOT NULL,
                                                          room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE
                    )
            `);
        } finally {
            client.release();
        }
    }

    static async createAppliance(name: string, roomId: number): Promise<Appliance> {
        const client = await db.connect();
        try {
            const result = await client.query(
                'INSERT INTO appliances (name, room_id) VALUES ($1, $2) RETURNING id, name, room_id',
                [name, roomId]
            );
            const { id, name: returnedName, room_id } = result.rows[0];
            return new Appliance(id, returnedName, room_id);
        } finally {
            client.release();
        }
    }

    static async findByRoomId(roomId: number): Promise<Appliance[]> {
        const client = await db.connect();
        try {
            const result = await client.query('SELECT * FROM appliances WHERE room_id = $1', [roomId]);
            return result.rows.map(row => new Appliance(row.id, row.name, row.room_id));
        } finally {
            client.release();
        }
    }

    static async findById(id: number): Promise<Appliance | null> {
        const client = await db.connect();
        try {
            const result = await client.query('SELECT * FROM appliances WHERE id = $1', [id]);
            if (result.rows.length === 0) {
                return null;
            }
            const row = result.rows[0];
            return new Appliance(row.id, row.name, row.room_id);
        } finally {
            client.release();
        }
    }

    static async updateAppliance(id: number, name: string): Promise<Appliance> {
        const client = await db.connect();
        try {
            const result = await client.query(
                'UPDATE appliances SET name = $1 WHERE id = $2 RETURNING id, name, room_id',
                [name, id]
            );
            const { id: returnedId, name: returnedName, room_id } = result.rows[0];
            return new Appliance(returnedId, returnedName, room_id);
        } finally {
            client.release();
        }
    }

    static async deleteAppliance(id: number): Promise<void> {
        const client = await db.connect();
        try {
            await client.query('DELETE FROM appliances WHERE id = $1', [id]);
        } finally {
            client.release();
        }
    }
}

export default Appliance;