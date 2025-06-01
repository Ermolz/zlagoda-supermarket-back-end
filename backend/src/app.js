import express from 'express';
import config from './config/index.js';
import authRoutes from './routes/auth.routes.js';
import cashierRoutes from './routes/cashier.routes.js';
import managerRoutes from './routes/manager.routes.js';
import { authMiddleware } from './middlewares/auth.middleware.js';

const app = express();
// ===== REQUEST LOGGING =====
// TODO: app.use(httpLogger);

// ===== GLOBAL MIDDLEWARES =====
app.use(express.json());

// ===== ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/cashier', authMiddleware, cashierRoutes);
app.use('/api/manager', authMiddleware, managerRoutes);

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

export default app;
