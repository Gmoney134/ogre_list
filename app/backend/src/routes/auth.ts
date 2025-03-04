// src/routes/auth.ts
import express from 'express';
import { authController } from '../controllers';
import { authenticateToken } from '../middleware';

const router = express.Router();

// Register a new user
router.post('/register', authController.registerUser);

// Login an existing user
router.post('/login', authController.loginUser);

// Example of a protected route
router.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route', userId: (req as any).userId });
});

export default router;