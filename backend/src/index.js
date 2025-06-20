import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import app from './app.js';
import config from './config/index.js';
import { logger } from './utils/logger.js';

dotenv.config();

const PORT = config.port;

// Middleware

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true // This is important for cookies
}));

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

export default app;