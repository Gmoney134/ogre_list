var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
class AuthController {
    static registerUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, password, email } = req.body; //add email
            try {
                const existingUser = yield User.findByUsername(username);
                if (existingUser) {
                    return res.status(400).json({ message: 'Username already exists' });
                }
                //add email
                if (!email) {
                    return res.status(400).json({ message: 'Email required' });
                }
                const hashedPassword = yield bcrypt.hash(password, 10);
                const newUser = yield User.createUser(username, hashedPassword, email); //add email
                res.status(201).json({ message: 'User created successfully', user: newUser });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Error creating user' });
            }
        });
    }
    static loginUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, password } = req.body;
            try {
                const user = yield User.findByUsername(username);
                if (!user) {
                    return res.status(400).json({ message: 'Invalid username or password' });
                }
                const isPasswordValid = yield bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    return res.status(400).json({ message: 'Invalid username or password' });
                }
                const token = jwt.sign({ userId: user.id }, (process.env.JWT_SECRET || 'your_jwt_secret'), { expiresIn: '1h' });
                res.status(200).json({ message: 'Login successful', token });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Error logging in' });
            }
        });
    }
}
export default AuthController;
