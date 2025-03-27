import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { Request, Response } from 'express'; // Import Request and Response from express

class AuthController {
    static async registerUser(req: Request, res: Response) { // Add types to req and res
        const { username, password, email } = req.body; //add email

        try {
            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                return res.status(400).json({ message: 'Username already exists' });
            }
            //add email
            if (!email) {
                return res.status(400).json({ message: 'Email required' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await User.createUser(username, hashedPassword, email);//add email

            res.status(201).json({ message: 'User created successfully', user: newUser });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error creating user' });
        }
    }

    static async loginUser(req: Request, res: Response) { // Add types to req and res
        const { username, password } = req.body;

        try {
            const user = await User.findByUsername(username);
            if (!user) {
                return res.status(400).json({ message: 'Invalid username or password' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password as string);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Invalid username or password' });
            }

            const token = jwt.sign({ userId: user.id }, (process.env.JWT_SECRET || 'your_jwt_secret') as string, { expiresIn: '1h' });

            res.status(200).json({ message: 'Login successful', token });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error logging in' });
        }
    }
}

export default AuthController;