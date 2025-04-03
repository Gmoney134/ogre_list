import express from 'express';
import { verifyToken } from '../middleware/index.js';
import { DashboardController } from '../controllers/index.js';

const router = express.Router();

router.get('/', verifyToken, DashboardController.getDashboardData);

export default router;