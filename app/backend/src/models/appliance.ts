import db from '../config/database.js';

class Appliance {
    public id?: number;
    public name?: string;
    public roomId?: number;
    public model?: string;
    public brand?: string;
    public purchaseDate?: Date;
    public reminderDate?: Date | null;
    public websiteLink?: string | null;

    constructor(id?: number, name?: string, roomId?: number, model?: string, brand?: string, purchaseDate?: Date, reminderDate?: Date | null, websiteLink?: string | null) {
        this.id = id;
        this.name = name;
        this.roomId = roomId;
        this.model = model;
        this.brand = brand;
        this.purchaseDate = purchaseDate;
        this.reminderDate = reminderDate || null;
        this.websiteLink = websiteLink || null;
    }

    static async createTable() {
        const client = await db.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS appliances (
                                                          id SERIAL PRIMARY KEY,
                                                          name TEXT NOT NULL,
                                                          room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
                    model TEXT,
                    brand TEXT,
                    purchase_date DATE,
                    reminder_date TIMESTAMP,
                    website_link TEXT
                    )
            `);
        } finally {
            client.release();
        }
    }

    static async createAppliance(name: string, roomId: number, model?: string, brand?: string, purchaseDate?: Date, reminderDate?: Date | null, websiteLink?: string | null): Promise<Appliance> {
        const client = await db.connect();
        try {
            const result = await client.query(
                `INSERT INTO appliances (name, room_id, model, brand, purchase_date, reminder_date, website_link)
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, room_id, model, brand, purchase_date, reminder_date, website_link`,
                [name, roomId, model, brand, purchaseDate, reminderDate || null, websiteLink || null]
            );
            const { id, name: returnedName, room_id, model: returnedModel, brand: returnedBrand, purchase_date, reminder_date, website_link } = result.rows[0];
            return new Appliance(id, returnedName, room_id, returnedModel, returnedBrand, purchase_date, reminder_date, website_link);
        } finally {
            client.release();
        }
    }

    static async updateAppliance(id: number, name: string, model?: string, brand?: string, purchaseDate?: Date, reminderDate?: Date | null, websiteLink?: string | null): Promise<Appliance> {
        const client = await db.connect();
        try {
            const result = await client.query(
                `UPDATE appliances SET name = $1, model = $2, brand = $3, purchase_date = $4, reminder_date = $5, website_link = $6 WHERE id = $7
                    RETURNING id, name, room_id, model, brand, purchase_date, reminder_date, website_link`,
                [name, model, brand, purchaseDate, reminderDate || null, websiteLink || null, id]
            );
            const { id: returnedId, name: returnedName, room_id, model: returnedModel, brand: returnedBrand, purchase_date, reminder_date, website_link } = result.rows[0];
            return new Appliance(returnedId, returnedName, room_id, returnedModel, returnedBrand, purchase_date, reminder_date, website_link);
        } finally {
            client.release();
        }
    }

    // New static findById method
    static async findById(id: number): Promise<Appliance | null> {
        const client = await db.connect();
        try {
            const result = await client.query(
                `SELECT * FROM appliances WHERE id = $1`,
                [id]
            );
            if (result.rows.length === 0) {
                return null;
            }
            const { id: returnedId, name, room_id, model, brand, purchase_date, reminder_date, website_link } = result.rows[0];
            return new Appliance(returnedId, name, room_id, model, brand, purchase_date, reminder_date, website_link);
        } finally {
            client.release();
        }
    }

    // New static findAllWithPastReminderDate method
    static async findAllWithPastReminderDate(date: Date): Promise<Appliance[]> {
        const client = await db.connect();
        try {
            const result = await client.query('SELECT * FROM appliances WHERE reminder_date <= $1', [date]);
            return result.rows.map(row => new Appliance(row.id, row.name, row.room_id, row.model, row.brand, row.purchase_date, row.reminder_date, row.website_link));
        } finally {
            client.release();
        }
    }

    static async findByRoomId(roomId: number): Promise<Appliance[]> {
        const client = await db.connect();
        try {
            const result = await client.query('SELECT * FROM appliances WHERE room_id = $1', [roomId]);
            return result.rows.map(row => new Appliance(row.id, row.name, row.room_id, row.model, row.brand, row.purchase_date, row.reminder_date, row.website_link));
        } finally {
            client.release();
        }
    }

    static async deleteAppliance(applianceId: number): Promise<void> {
        const client = await db.connect();
        try {
            await client.query('DELETE FROM appliances WHERE id = $1', [applianceId]);
        } finally {
            client.release();
        }
    }
}

export default Appliance;