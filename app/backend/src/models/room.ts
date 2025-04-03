import db from '../config/database.js';

class Room {
    public id?: number;
    public name?: string;
    public houseId?: number;
    public description?: string;
    public squareFootage?: number;
    public reminderDate?: Date | null;
    public websiteLink?: string | null;

    constructor(id?: number, name?: string, houseId?: number, description?: string, squareFootage?: number, reminderDate?: Date | null, websiteLink?: string | null) {
        this.id = id;
        this.name = name;
        this.houseId = houseId;
        this.description = description;
        this.squareFootage = squareFootage;
        this.reminderDate = reminderDate || null;
        this.websiteLink = websiteLink || null;
    }

    static async createTable() {
        const client = await db.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS rooms (
                                                     id SERIAL PRIMARY KEY,
                                                     name TEXT NOT NULL,
                                                     house_id INTEGER REFERENCES houses(id) ON DELETE CASCADE,
                    description TEXT,
                    square_footage INTEGER,
                    reminder_date TIMESTAMP,
                    website_link TEXT
                    )
            `);
        } finally {
            client.release();
        }
    }

    static async createRoom(name: string, houseId: number, description?: string, squareFootage?: number, reminderDate?: Date | null, websiteLink?: string | null): Promise<Room> {
        const client = await db.connect();
        try {
            const result = await client.query(
                `INSERT INTO rooms (name, house_id, description, square_footage, reminder_date, website_link)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, house_id, description, square_footage, reminder_date, website_link`,
                [name, houseId, description, squareFootage, reminderDate || null, websiteLink || null]
            );
            const { id, name: returnedName, house_id, description: returnedDescription, square_footage, reminder_date, website_link } = result.rows[0];
            return new Room(id, returnedName, house_id, returnedDescription, square_footage, reminder_date, website_link);
        } finally {
            client.release();
        }
    }

    static async updateRoom(id: number, name: string, description?: string, squareFootage?: number, reminderDate?: Date | null, websiteLink?: string | null): Promise<Room> {
        const client = await db.connect();
        try {
            const result = await client.query(
                `UPDATE rooms SET name = $1, description = $2, square_footage = $3, reminder_date = $4, website_link = $5 WHERE id = $6
                    RETURNING id, name, house_id, description, square_footage, reminder_date, website_link`,
                [name, description, squareFootage, reminderDate || null, websiteLink || null, id]
            );
            const { id: returnedId, name: returnedName, house_id, description: returnedDescription, square_footage, reminder_date, website_link } = result.rows[0];
            return new Room(returnedId, returnedName, house_id, returnedDescription, square_footage, reminder_date, website_link);
        } finally {
            client.release();
        }
    }

    // New static findById method
    static async findById(id: number): Promise<Room | null> {
        const client = await db.connect();
        try {
            const result = await client.query(
                `SELECT * FROM rooms WHERE id = $1`,
                [id]
            );
            if (result.rows.length === 0) {
                return null;
            }
            const { id: returnedId, name, house_id, description, square_footage, reminder_date, website_link } = result.rows[0];
            return new Room(returnedId, name, house_id, description, square_footage, reminder_date, website_link);
        } finally {
            client.release();
        }
    }

    // New static findAllWithPastReminderDate method
    static async findAllWithPastReminderDate(date: Date): Promise<Room[]> {
        const client = await db.connect();
        try {
            const result = await client.query('SELECT * FROM rooms WHERE reminder_date <= $1', [date]);
            return result.rows.map(row => new Room(row.id, row.name, row.house_id, row.description, row.square_footage, row.reminder_date, row.website_link));
        } finally {
            client.release();
        }
    }

    static async findByHouseId(houseId: number): Promise<Room[]> {
        const client = await db.connect();
        try {
            const result = await client.query('SELECT * FROM rooms WHERE house_id = $1', [houseId]);
            return result.rows.map(row => new Room(row.id, row.name, row.house_id, row.description, row.square_footage, row.reminder_date, row.website_link));
        } finally {
            client.release();
        }
    }

    static async deleteRoom(roomId: number): Promise<void> {
        const client = await db.connect();
        try {
            await client.query('DELETE FROM rooms WHERE id = $1', [roomId]);
        } finally {
            client.release();
        }
    }
}

export default Room;