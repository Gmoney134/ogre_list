import { Pool } from 'pg';

const pool = new Pool({
    user: 'postgres', // Hardcoded
    password: 'password', // Hardcoded
    host: 'database-1.cr68ueaeqtcj.us-east-2.rds.amazonaws.com', // Hardcoded
    port: 5432, // Hardcoded
    database: 'database-1', // Hardcoded
    ssl: {
        rejectUnauthorized: false
    }
});

export default pool;