import db from '../config/database.js';

class House {
    public id?: number;
    public name?: string;
    public userId?: number;
    public yearBuilt?: number;
    public address?: string;
    public reminderDate?: Date | null;
    public websiteLink?: string | null;

    constructor(id?: number, name?: string, userId?: number, yearBuilt?: number, address?: string, reminderDate?: Date | null, websiteLink?: string | null) {
        this.id = id;
        this.name = name;
        this.userId = userId;
        this.yearBuilt = yearBuilt;
        this.address = address;
        this.reminderDate = reminderDate || null;
        this.websiteLink = websiteLink || null;
    }

    static async createTable() {
        const client = await db.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS houses (
                                                      id SERIAL PRIMARY KEY,
                                                      name TEXT NOT NULL,
                                                      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    year_built INTEGER,
                    address TEXT,
                    reminder_date TIMESTAMP,
                    website_link TEXT
                    )
            `);
        } finally {
            client.release();
        }
    }

    static async createHouse(name: string, userId: number, yearBuilt?: number, address?: string, reminderDate?: Date | null, websiteLink?: string | null): Promise<House> {
        const client = await db.connect();
        try {
            const result = await client.query(
                `INSERT INTO houses (name, user_id, year_built, address, reminder_date, website_link)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, user_id, year_built, address, reminder_date, website_link`,
                [name, userId, yearBuilt, address || null, reminderDate || null, websiteLink || null]
            );
            const { id, name: returnedName, user_id, year_built, reminder_date, website_link } = result.rows[0];
            return new House(id, returnedName, user_id, year_built, address, reminder_date, website_link);
        } finally {
            client.release();
        }
    }

    static async updateHouse(id: number, name: string, yearBuilt?: number, address?: string, reminderDate?: Date | null, websiteLink?: string | null): Promise<House> {
        const client = await db.connect();
        try {
            const result = await client.query(
                `UPDATE houses SET name = $1, year_built = $2, address = $3, reminder_date = $4, website_link = $5 WHERE id = $6
                    RETURNING id, name, user_id, year_built, address, reminder_date, website_link`,
                [name, yearBuilt, address, reminderDate || null, websiteLink || null, id]
            );
            const { id: returnedId, name: returnedName, user_id, year_built, reminder_date, website_link } = result.rows[0];
            return new House(returnedId, returnedName, user_id, year_built, address, reminder_date, website_link);
        } finally {
            client.release();
        }
    }

    // New static findById method
    static async findById(id: number): Promise<House | null> {
        const client = await db.connect();
        try {
            const result = await client.query(
                `SELECT * FROM houses WHERE id = $1`,
                [id]
            );
            if (result.rows.length === 0) {
                return null;
            }
            const { id: returnedId, name, user_id, year_built, address, reminder_date, website_link } = result.rows[0];
            return new House(returnedId, name, user_id, year_built, address, reminder_date, website_link);
        } finally {
            client.release();
        }
    }

    // New static findAllWithPastReminderDate method
    static async findAllWithPastReminderDate(date: Date): Promise<House[]> {
        const client = await db.connect();
        try {
            const result = await client.query('SELECT * FROM houses WHERE reminder_date <= $1', [date]);
            return result.rows.map(row => new House(row.id, row.name, row.user_id, row.year_built, row.address, row.reminder_date, row.website_link));
        } finally {
            client.release();
        }
    }

    static async findByUserId(userId: number): Promise<House[]> {
        const client = await db.connect();
        try {
            const result = await client.query('SELECT * FROM houses WHERE user_id = $1', [userId]);
            return result.rows.map(row => new House(row.id, row.name, row.user_id, row.year_built, row.address, row.reminder_date, row.website_link));
        } finally {
            client.release();
        }
    }

    static async deleteHouse(houseId: number): Promise<void> {
        const client = await db.connect();
        try {
            await client.query('DELETE FROM houses WHERE id = $1', [houseId]);
        } finally {
            client.release();
        }
    }
}

export default House;