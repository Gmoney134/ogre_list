"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    user: 'postgres', // Hardcoded
    password: 'password', // Hardcoded
    host: 'database-1.cr68ueaeqtcj.us-east-2.rds.amazonaws.com', // Hardcoded
    port: 5432, // Hardcoded
    database: 'database-1', // Hardcoded
    ssl: {
        rejectUnauthorized: false
    }
});
exports.default = pool;
