import express from 'express';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login to the system
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Employee email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Employee password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new employee
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *               - surname
 *               - name
 *               - patronymic
 *               - salary
 *               - date_of_birth
 *               - date_of_start
 *               - phone_number
 *               - city
 *               - street
 *               - zip_code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Employee email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Employee password
 *               role:
 *                 type: string
 *                 enum: [cashier, manager]
 *                 description: Employee role
 *               surname:
 *                 type: string
 *                 description: Employee surname
 *               name:
 *                 type: string
 *                 description: Employee name
 *               patronymic:
 *                 type: string
 *                 description: Employee patronymic
 *               salary:
 *                 type: number
 *                 description: Employee salary
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 description: Employee date of birth
 *               date_of_start:
 *                 type: string
 *                 format: date
 *                 description: Employee start date
 *               phone_number:
 *                 type: string
 *                 description: Employee phone number
 *               city:
 *                 type: string
 *                 description: Employee city
 *               street:
 *                 type: string
 *                 description: Employee street
 *               zip_code:
 *                 type: string
 *                 description: Employee ZIP code
 *     responses:
 *       201:
 *         description: Employee registered successfully
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Server error
 */
router.post('/register', authController.register);

// TODO: Add authentication routes here
// Example:
// router.post('/logout', authController.logout);

export default router; 