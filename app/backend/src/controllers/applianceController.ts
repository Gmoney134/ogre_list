import { Request, Response } from 'express';
import Appliance from '../models/appliance.js';
import Room from '../models/room.js';
import House from '../models/house.js';

interface CustomRequest extends Request {
    userId?: number;
}

class ApplianceController {
    static async createAppliance(req: CustomRequest, res: Response) {
        try {
            const userId = req.userId;
            const { name, roomId } = req.body;

            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            if (!name || !roomId) {
                return res.status(400).json({ message: 'Name and roomId are required' });
            }

            const room = await Room.findById(roomId);
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

            const appliance = await Appliance.createAppliance(name, roomId);
            res.status(201).json(appliance);
        } catch (error) {
            console.error('Error creating appliance:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getAppliancesByRoomId(req: CustomRequest, res: Response) {
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

            const appliances = await Appliance.findByRoomId(parseInt(roomId));
            res.json(appliances);
        } catch (error) {
            console.error('Error getting appliances:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async updateAppliance(req: CustomRequest, res: Response) {
        try {
            const userId = req.userId;
            const { applianceId } = req.params;
            const { name } = req.body;

            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const appliance = await Appliance.findById(parseInt(applianceId));
            if (!appliance) {
                return res.status(404).json({ message: 'Appliance not found' });
            }

            const room = await Room.findById(appliance.roomId!);
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

            const updatedAppliance = await Appliance.updateAppliance(parseInt(applianceId), name);
            res.json(updatedAppliance);
        } catch (error) {
            console.error('Error updating appliance:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async deleteAppliance(req: CustomRequest, res: Response) {
        try {
            const userId = req.userId;
            const { applianceId } = req.params;

            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const appliance = await Appliance.findById(parseInt(applianceId));
            if (!appliance) {
                return res.status(404).json({ message: 'Appliance not found' });
            }

            const room = await Room.findById(appliance.roomId!);
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

            await Appliance.deleteAppliance(parseInt(applianceId));
            res.status(204).send();
        } catch (error) {
            console.error('Error deleting appliance:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export default ApplianceController;