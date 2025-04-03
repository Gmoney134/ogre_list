import express from 'express';
import { ApplianceController } from '../controllers/index.js';
import { verifyToken } from '../middleware/index.js';

const router = express.Router();

router.post('/', verifyToken, ApplianceController.createAppliance);
router.get('/:roomId', verifyToken, ApplianceController.getAppliancesByRoomId);
router.put('/:applianceId', verifyToken, ApplianceController.updateAppliance);
router.delete('/:applianceId', verifyToken, ApplianceController.deleteAppliance);

export default router;