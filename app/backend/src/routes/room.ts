import express from 'express';
import { RoomController } from '../controllers/index.js';
import { verifyToken } from '../middleware/index.js';

const router = express.Router();

router.post('/', verifyToken, RoomController.createRoom);
router.get('/:houseId', verifyToken, RoomController.getRoomsByHouseId);
router.put('/:roomId', verifyToken, RoomController.updateRoom);
router.delete('/:roomId', verifyToken, RoomController.deleteRoom);

export default router;