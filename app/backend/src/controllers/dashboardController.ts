import { Request, Response } from 'express';
import { House, Room, Appliance, Part } from '../models/index.js';

interface CustomRequest extends Request {
    userId?: number;
}

class DashboardController {
    static async getDashboardData(req: CustomRequest, res: Response) {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // Find the houses associated with the user
            const houses = await House.findByUserId(userId);

            if (!houses || houses.length === 0) {
                return res.json([]); // Return empty array if no houses are found
            }

            // Fetch all data for each house
            const dashboardData = await Promise.all(houses.map(async (house) => {
                const rooms = await Room.findByHouseId(house.id!);
                const roomsWithAppliancesAndParts = await Promise.all(rooms.map(async (room) => {
                    const appliances = await Appliance.findByRoomId(room.id!);
                    const appliancesWithParts = await Promise.all(appliances.map(async (appliance) => {
                        const parts = await Part.findByApplianceId(appliance.id!);
                        return { ...appliance, parts };
                    }));
                    return { ...room, appliances: appliancesWithParts };
                }));
                return { ...house, rooms: roomsWithAppliancesAndParts };
            }));

            res.json(dashboardData);
        } catch (error) {
            console.error('Error getting dashboard data:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export default DashboardController;