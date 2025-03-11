// src/routes/index.ts
import express from 'express';
import authRoutes from './auth.js'; //added .js
const router = express.Router();
router.use('/auth', authRoutes);
export default router;
