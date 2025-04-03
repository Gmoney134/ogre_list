import db from '../config/database.js';
import { QueryResult } from 'pg';

interface PartRow {
    id: number;
    name: string;
    appliance_id: number;
    reminder_date: Date | null;
    website_link: string | null;
}

class Part {
    public id?: number;
    public name?: string;
    public applianceId?: number;
    public reminderDate?: Date | null;
    public websiteLink?: string | null;

    constructor(id?: number, name?: string, applianceId?: number, reminderDate?: Date | null, websiteLink?: string | null) {
        this.id = id;
        this.name = name;
        this.applianceId = applianceId;
        this.reminderDate = reminderDate || null;
        this.websiteLink = websiteLink || null;
    }

    static async createTable() {
        const client = await db.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS parts (
                                                     id SERIAL PRIMARY KEY,
                                                     name TEXT NOT NULL,
                                                     appliance_id INTEGER REFERENCES appliances(id) ON DELETE CASCADE,
                    reminder_date TIMESTAMP,
                    website_link TEXT
                    )
            `);
        } finally {
            client.release();
        }
    }

    static async createPart(name: string, applianceId: number, reminderDate?: Date | null, websiteLink?: string | null): Promise<Part> {
        const client = await db.connect();
        try {
            const result: QueryResult<PartRow> = await client.query(
                `INSERT INTO parts (name, appliance_id, reminder_date, website_link)
                 VALUES ($1, $2, $3, $4) RETURNING id, name, appliance_id, reminder_date, website_link`,
                [name, applianceId, reminderDate || null, websiteLink || null]
            );
            if (result.rows.length === 0) {
                throw new Error("Failed to create part");
            }
            const { id, name: returnedName, appliance_id, reminder_date, website_link } = result.rows[0];
            return new Part(id, returnedName, appliance_id, reminder_date, website_link);
        } catch (error) {
            console.error("Error creating part:", error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async updatePart(id: number, name: string, reminderDate?: Date | null, websiteLink?: string | null): Promise<Part> {
        const client = await db.connect();
        try {
            const result: QueryResult<PartRow> = await client.query(
                `UPDATE parts SET name = $1, reminder_date = $2, website_link = $3 WHERE id = $4
                    RETURNING id, name, appliance_id, reminder_date, website_link`,
                [name, reminderDate || null, websiteLink || null, id]
            );
            if (result.rows.length === 0) {
                throw new Error(`Part with id ${id} not found`);
            }
            const { id: returnedId, name: returnedName, appliance_id, reminder_date, website_link } = result.rows[0];
            return new Part(returnedId, returnedName, appliance_id, reminder_date, website_link);
        } catch (error) {
            console.error("Error updating part:", error);
            throw error;
        } finally {
            client.release();
        }
    }

    // New static findById method
    static async findById(id: number): Promise<Part | null> {
        const client = await db.connect();
        try {
            const result: QueryResult<PartRow> = await client.query(
                `SELECT * FROM parts WHERE id = $1`,
                [id]
            );
            if (result.rows.length === 0) {
                return null;
            }
            const { id: returnedId, name, appliance_id, reminder_date, website_link } = result.rows[0];
            return new Part(returnedId, name, appliance_id, reminder_date, website_link);
        } finally {
            client.release();
        }
    }

    // New static findAllWithPastReminderDate method
    static async findAllWithPastReminderDate(date: Date): Promise<Part[]> {
        const client = await db.connect();
        try {
            const result: QueryResult<PartRow> = await client.query(
                `SELECT * FROM parts WHERE reminder_date <= $1`,
                [date]
            );
            return result.rows.map(
                (row) =>
                    new Part(
                        row.id,
                        row.name,
                        row.appliance_id,
                        row.reminder_date,
                        row.website_link
                    )
            );
        } finally {
            client.release();
        }
    }

    static async findByApplianceId(applianceId: number): Promise<Part[]> {
        const client = await db.connect();
        try {
            const result: QueryResult<PartRow> = await client.query(
                `SELECT * FROM parts WHERE appliance_id = $1`,
                [applianceId]
            );
            return result.rows.map(
                (row) =>
                    new Part(
                        row.id,
                        row.name,
                        row.appliance_id,
                        row.reminder_date,
                        row.website_link
                    )
            );
        } finally {
            client.release();
        }
    }

    static async deletePart(partId: number): Promise<void> {
        const client = await db.connect();
        try {
            await client.query('DELETE FROM parts WHERE id = $1', [partId]);
        } finally {
            client.release();
        }
    }
}

export default Part;