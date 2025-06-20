import express from 'express';
import config from './config/index.js';
import authRoutes from './routes/auth.routes.js';
import cashierRoutes from './routes/cashier.routes.js';
import managerRoutes from './routes/manager.routes.js';
import statisticsRoutes from './routes/statistics.routes.js';
import { authMiddleware } from './middlewares/auth.middleware.js';
import cors from 'cors';
import { logger, requestLogger } from './utils/logger.js';

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const app = express();

// === Middleware ===
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(requestLogger);

// === Routes ===
app.use('/api/auth', authRoutes);
app.use('/api/cashier', authMiddleware, cashierRoutes);
app.use('/api/manager', authMiddleware, managerRoutes);
app.use('/api/statistics', statisticsRoutes);

// === Swagger config ===
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Zlagoda API Documentation',
            version: '1.0.0',
            description: 'API documentation for the Zlagoda store management system'
        },
        servers: [
            {
                url: `http://localhost:${config.port}`,
                description: 'Development server'
            }
        ]
    },
    apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// === Error Handling ===
app.use((err, req, res, next) => {
    logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params,
        user: req.user ? {
            id: req.user.id,
            role: req.user.role
        } : null
    });

    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({ 
        status, 
        message,
        timestamp: new Date().toISOString()
    });
});

// === 404 Handler ===
app.use((req, res) => {
    logger.warn('Route not found', {
        url: req.originalUrl,
        method: req.method
    });
    
    res.status(404).json({ 
        status: 404, 
        message: 'Route not found',
        timestamp: new Date().toISOString()
    });
});

export default app;
