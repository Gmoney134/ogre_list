import { Request, Response } from 'express';
import House from '../models/house.js';

interface CustomRequest extends Request {
    userId?: number;
}

class HouseController {
    static async createHouse(req: CustomRequest, res: Response) {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ message: 'Name is required' });
            }
            const house = await House.createHouse(name, userId);
            res.status(201).json(house);
        } catch (error) {
            console.error('Error creating house:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getHousesByUserId(req: CustomRequest, res: Response) {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const houses = await House.findByUserId(userId);
            res.json(houses);
        } catch (error) {
            console.error('Error getting houses:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async updateHouse(req: CustomRequest, res: Response) {
        try {
            const userId = req.userId;
            const { houseId } = req.params;
            const { name } = req.body;

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

            const updatedHouse = await House.updateHouse(parseInt(houseId), name);
            res.json(updatedHouse);
        } catch (error) {
            console.error('Error updating house:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async deleteHouse(req: CustomRequest, res: Response) {
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

            await House.deleteHouse(parseInt(houseId));
            res.status(204).send();
        } catch (error) {
            console.error('Error deleting house:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export default HouseController;