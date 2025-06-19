import pg from 'pg';
import { logger } from '../utils/logger.js';
const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER || 'zlagoda_user',
    host: process.env.DB_HOST || 'postgres',
    database: process.env.DB_NAME || 'zlagoda_db',
    password: process.env.DB_PASSWORD || 'zlagoda123',
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
    } : false
});

pool.on('error', (err) => {
    logger.error('Unexpected error on idle client', { error: err.message });
    process.exit(-1);
});

pool.on('connect', () => {
    logger.info('Connected to the database');
});

pool.query('SELECT 1')
    .then(() => logger.info('Initial DB connection successful'))
    .catch(err => logger.error('Initial DB connection failed', { error: err.message }));

export default pool; 