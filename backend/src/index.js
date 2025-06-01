import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import employeeRoutes from '../routes/employee.routes.js';
import app from './app.js';
import config from './config/index.js';

dotenv.config();

const PORT = config.port;

// Middleware
const appMiddleware = express();
appMiddleware.use(express.json());
appMiddleware.use(cookieParser());
appMiddleware.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true // This is important for cookies
}));

// Routes
appMiddleware.use('/api/employees', employeeRoutes);

// ... existing code ...

appMiddleware.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default appMiddleware;