import pkg from 'pg'; //changed import
const { Pool } = pkg;
const pool = new Pool({
    user: 'postgres',
    password: 'password',
    host: 'database-1.cr68ueaeqtcj.us-east-2.rds.amazonaws.com',
    port: 5432,
    database: 'postgres',
    ssl: {
        rejectUnauthorized: false
    },
});
export default pool;
