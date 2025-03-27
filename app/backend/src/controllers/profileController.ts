import { Request, Response } from 'express';
import User from '../models/user.js';

interface CustomRequest extends Request { // add this type
    userId?: number;
}

class ProfileController {
    static async getProfile(req: CustomRequest, res: Response) { //update this function
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json(user);
        } catch (error) {
            console.error('Error getting profile:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async updateProfile(req: CustomRequest, res: Response) { //update this function
        try {
            const userId = req.userId;
            const { username, password, email } = req.body; //add email

            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const updatedUser = await User.updateUser(userId, username, password, email);//add email
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json(updatedUser);
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}
export default ProfileController;