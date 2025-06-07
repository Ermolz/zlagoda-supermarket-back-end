import express from 'express';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: Get all employees
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/', (req, res) => {
    res.json({ message: 'Employee route is working!' });
  });


router.post('/register', authController.register);
router.post('/login', authController.login);

export default router;
