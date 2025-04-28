import express from 'express';
import { HouseController } from '../controllers/index.js';
import { verifyToken } from '../middleware/index.js';

const router = express.Router();

router.post('/', verifyToken, HouseController.createHouse);
router.get('/', verifyToken, HouseController.getHousesByUserId);
router.get('/:houseid', verifyToken, HouseController.getHouseById);
router.put('/:houseId', verifyToken, HouseController.updateHouse);
router.delete('/:houseId', verifyToken, HouseController.deleteHouse);

export default router;