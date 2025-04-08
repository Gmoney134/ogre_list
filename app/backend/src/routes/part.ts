import express from 'express';
import { PartController } from '../controllers/index.js';
import { verifyToken } from '../middleware/index.js';

const router = express.Router();

router.post('/', verifyToken, PartController.createPart);
router.get('/:applianceId', verifyToken, PartController.getPartsByApplianceId);
router.put('/:partId', verifyToken, PartController.updatePart);
router.delete('/:partId', verifyToken, PartController.deletePart);

export default router;