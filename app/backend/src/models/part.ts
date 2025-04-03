import db from '../config/database.js';

class Part {
    public id?: number;
    public name?: string;
    public applianceId?: number;

    constructor(id?: number, name?: string, applianceId?: number) {
        this.id = id;
        this.name = name;
        this.applianceId = applianceId;
    }

    static async createTable() {
        const client = await db.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS parts (
                                                     id SERIAL PRIMARY KEY,
                                                     name TEXT NOT NULL,
                                                     appliance_id INTEGER REFERENCES appliances(id) ON DELETE CASCADE
                    )
            `);
        } finally {
            client.release();
        }
    }

    static async createPart(name: string, applianceId: number): Promise<Part> {
        const client = await db.connect();
        try {
            const result = await client.query(
                'INSERT INTO parts (name, appliance_id) VALUES ($1, $2) RETURNING id, name, appliance_id',
                [name, applianceId]
            );
            const { id, name: returnedName, appliance_id } = result.rows[0];
            return new Part(id, returnedName, appliance_id);
        } finally {
            client.release();
        }
    }

    static async findByApplianceId(applianceId: number): Promise<Part[]> {
        const client = await db.connect();
        try {
            const result = await client.query('SELECT * FROM parts WHERE appliance_id = $1', [applianceId]);
            return result.rows.map(row => new Part(row.id, row.name, row.appliance_id));
        } finally {
            client.release();
        }
    }

    static async findById(id: number): Promise<Part | null> {
        const client = await db.connect();
        try {
            const result = await client.query('SELECT * FROM parts WHERE id = $1', [id]);
            if (result.rows.length === 0) {
                return null;
            }
            const row = result.rows[0];
            return new Part(row.id, row.name, row.appliance_id);
        } finally {
            client.release();
        }
    }

    static async updatePart(id: number, name: string): Promise<Part> {
        const client = await db.connect();
        try {
            const result = await client.query(
                'UPDATE parts SET name = $1 WHERE id = $2 RETURNING id, name, appliance_id',
                [name, id]
            );
            const { id: returnedId, name: returnedName, appliance_id } = result.rows[0];
            return new Part(returnedId, returnedName, appliance_id);
        } finally {
            client.release();
        }
    }

    static async deletePart(id: number): Promise<void> {
        const client = await db.connect();
        try {
            await client.query('DELETE FROM parts WHERE id = $1', [id]);
        } finally {
            client.release();
        }
    }
}

export default Part;