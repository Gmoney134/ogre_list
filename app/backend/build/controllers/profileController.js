var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import User from '../models/user.js';
class ProfileController {
    static getProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                if (!userId) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }
                const user = yield User.findById(userId);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                res.json(user);
            }
            catch (error) {
                console.error('Error getting profile:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
    static updateProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                const { username, password, email } = req.body; //add email
                if (!userId) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }
                const updatedUser = yield User.updateUser(userId, username, password, email); //add email
                if (!updatedUser) {
                    return res.status(404).json({ message: 'User not found' });
                }
                res.json(updatedUser);
            }
            catch (error) {
                console.error('Error updating profile:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
}
export default ProfileController;
