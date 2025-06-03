import express from 'express';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Employee route is working!' });
  });

router.post('/register', authController.register);
router.post('/login', authController.login);

export default router;
