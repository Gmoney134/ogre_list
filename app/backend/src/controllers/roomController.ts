import { Request, Response } from 'express';
import Room from '../models/room.js';
import House from '../models/house.js';

interface CustomRequest extends Request {
    userId?: number;
}

class RoomController {
    static async createRoom(req: CustomRequest, res: Response) {
        try {
            const userId = req.userId;
            const { name, houseId } = req.body;

            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            if (!name || !houseId) {
                return res.status(400).json({ message: 'Name and houseId are required' });
            }

            const house = await House.findById(houseId);
            if (!house) {
                return res.status(404).json({ message: 'House not found' });
            }
            if (house.userId !== userId) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            const room = await Room.createRoom(name, houseId);
            res.status(201).json(room);
        } catch (error) {
            console.error('Error creating room:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getRoomsByHouseId(req: CustomRequest, res: Response) {
        try {
            const userId = req.userId;
            const { houseId } = req.params;

            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const house = await House.findById(parseInt(houseId));
            if (!house) {
                return res.status(404).json({ message: 'House not found' });
            }
            if (house.userId !== userId) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            const rooms = await Room.findByHouseId(parseInt(houseId));
            res.json(rooms);
        } catch (error) {
            console.error('Error getting rooms:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async updateRoom(req: CustomRequest, res: Response) {
        try {
            const userId = req.userId;
            const { roomId } = req.params;
            const { name } = req.body;

            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const room = await Room.findById(parseInt(roomId));
            if (!room) {
                return res.status(404).json({ message: 'Room not found' });
            }

            const house = await House.findById(room.houseId!);
            if (!house) {
                return res.status(404).json({ message: 'House not found' });
            }
            if (house.userId !== userId) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            const updatedRoom = await Room.updateRoom(parseInt(roomId), name);
            res.json(updatedRoom);
        } catch (error) {
            console.error('Error updating room:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async deleteRoom(req: CustomRequest, res: Response) {
        try {
            const userId = req.userId;
            const { roomId } = req.params;

            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const room = await Room.findById(parseInt(roomId));
            if (!room) {
                return res.status(404).json({ message: 'Room not found' });
            }

            const house = await House.findById(room.houseId!);
            if (!house) {
                return res.status(404).json({ message: 'House not found' });
            }
            if (house.userId !== userId) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            await Room.deleteRoom(parseInt(roomId));
            res.status(204).send();
        } catch (error) {
            console.error('Error deleting room:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export default RoomController;