import express from 'express';
import config from './config/index.js';
import authRoutes from './routes/auth.routes.js';
import cashierRoutes from './routes/cashier.routes.js';
import managerRoutes from './routes/manager.routes.js';
import { authMiddleware } from './middlewares/auth.middleware.js';
import cors from 'cors';

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());

// === Swagger config ===
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'My API Docs',
            version: '1.0.0',
        },
    },
    apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// === Routes ===
app.use('/api/auth', authRoutes);
app.use('/api/cashier', authMiddleware, cashierRoutes);
app.use('/api/manager', authMiddleware, managerRoutes);

// === Error Handling ===
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

export default app;
