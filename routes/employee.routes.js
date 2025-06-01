import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../app/Middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', requireAuth, authController.getCurrentUser);

export default router; 