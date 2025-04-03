import { Request, Response } from 'express';
import Part from '../models/part.js';
import Appliance from '../models/appliance.js';
import Room from '../models/room.js';
import House from '../models/house.js';

interface CustomRequest extends Request {
    userId?: number;
}

class PartController {
    static async createPart(req: CustomRequest, res: Response) {
        try {
            const userId = req.userId;
            const { name, applianceId, reminderDate, websiteLink } = req.body;

            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            if (!name || !applianceId) {
                return res.status(400).json({ message: 'Name and applianceId are required' });
            }

            const appliance = await Appliance.findById(applianceId);
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

            const part = await Part.createPart(name, applianceId, reminderDate, websiteLink);
            res.status(201).json(part);
        } catch (error) {
            console.error('Error creating part:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async updatePart(req: CustomRequest, res: Response) {
        try {
            const userId = req.userId;
            const { partId } = req.params;
            const { name, reminderDate, websiteLink } = req.body;

            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const part = await Part.findById(parseInt(partId));
            if (!part) {
                return res.status(404).json({ message: 'Part not found' });
            }

            const appliance = await Appliance.findById(part.applianceId!);
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

            const updatedPart = await Part.updatePart(parseInt(partId), name, reminderDate, websiteLink);
            res.json(updatedPart);
        } catch (error) {
            console.error('Error updating part:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getPartsByApplianceId(req: CustomRequest, res: Response) {
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

            const parts = await Part.findByApplianceId(parseInt(applianceId));
            res.json(parts);
        } catch (error) {
            console.error('Error getting parts by appliance ID:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async deletePart(req: CustomRequest, res: Response) {
        try {
            const userId = req.userId;
            const { partId } = req.params;

            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const part = await Part.findById(parseInt(partId));
            if (!part) {
                return res.status(404).json({ message: 'Part not found' });
            }

            const appliance = await Appliance.findById(part.applianceId!);
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

            await Part.deletePart(parseInt(partId));
            res.status(204).send();
        } catch (error) {
            console.error('Error deleting part:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export default PartController;