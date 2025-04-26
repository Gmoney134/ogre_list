import { Request, Response } from 'express';
import House from '../models/house.js';

interface CustomRequest extends Request {
    userId?: number;
}

class HouseController {


    static async getHouseById(req: CustomRequest, res: Response) {
        try {
            const userId = req.userId;
            const { houseId } = req.params;

            if (!userId) {
                // This check might be redundant if verifyToken always sets userId or throws
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // Validate and parse houseId
            const parsedHouseId = parseInt(houseId, 10);
            if (isNaN(parsedHouseId)) {
                return res.status(400).json({ message: 'Invalid house ID format' });
            }

            // Use the existing findById method from your House model
            const house = await House.findById(parsedHouseId);

            if (!house) {
                return res.status(404).json({ message: 'House not found' });
            }

            // *** Crucial Security Check: Ensure the house belongs to the requesting user ***
            if (house.userId !== userId) {
                // Use 403 Forbidden as the user is authenticated but not authorized for this specific resource
                return res.status(403).json({ message: 'Forbidden: You do not own this house' });
            }

            // If found and ownership verified, return the house
            res.json(house);

        } catch (error) {
            console.error('Error getting house by ID:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }




    static async createHouse(req: CustomRequest, res: Response) {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const { name, yearBuilt, address, reminderDate, websiteLink } = req.body;
            if (!name) {
                return res.status(400).json({ message: 'Name is required' });
            }
            const house = await House.createHouse(name, userId, yearBuilt, address, reminderDate, websiteLink);
            res.status(201).json(house);
        } catch (error) {
            console.error('Error creating house:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async updateHouse(req: CustomRequest, res: Response) {
        try {
            const userId = req.userId;
            const { houseId } = req.params;
            const { name, yearBuilt, address, reminderDate, websiteLink } = req.body;

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

            const updatedHouse = await House.updateHouse(parseInt(houseId), name, yearBuilt, address, reminderDate, websiteLink);
            res.json(updatedHouse);
        } catch (error) {
            console.error('Error updating house:', error);
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
            console.error('Error getting houses by user ID:', error);
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