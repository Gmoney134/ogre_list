import express from 'express';
import { verifyToken } from '../middleware/index.js'; //updated
import { ProfileController } from '../controllers/index.js';
const router = express.Router();
router.get('/me', verifyToken, ProfileController.getProfile);
router.put('/me', verifyToken, ProfileController.updateProfile);
export default router;
