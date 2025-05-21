import dotenv from 'dotenv';
dotenv.config();

const config = {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
    db: {
        host: process.env.DB_HOST || 'postgres',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        user: process.env.DB_USER || 'zlagoda_user',
        password: process.env.DB_PASSWORD || 'zlagoda123',
        database: process.env.DB_NAME || 'zlagoda_db',
    }
};

export default config;