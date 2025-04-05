import pkg from 'pg';
import dotenv from 'dotenv';
import process from 'process';

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
})

export default pool;
