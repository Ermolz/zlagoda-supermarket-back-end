import express from 'express';
import config from './config/index.js';


const app = express();
// ===== REQUEST LOGGING =====
// TODO: app.use(httpLogger);

// ===== GLOBAL MIDDLEWARES =====
app.use(express.json());

// ===== ROUTES =====
// TODO: app.use('/api/auth', authRoutes);


// ===== ROUTES =====
// TODO: app.use('/api/users', authMiddleware, userRoutes);

// ===== ERROR HANDLING =====
// TODO: app.use(errorHandler);

export default app;
