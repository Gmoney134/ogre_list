// src/middleware/authMiddleware.ts
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

// Load environment variables.
dotenv.config();

interface UserPayload extends JwtPayload {
    userId: string;
}

// Update the interface, to include all of the parameters from Request
interface AuthenticatedRequest extends Request {
    userId?: string; // Add a userId property to the Request interface
}

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // Get the token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    // Return an error if there is no token
    if (!token) {
        res.status(401).json({ message: 'Unauthorized: No token provided' });
        return;
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err: VerifyErrors | null, decoded: unknown) => {
        // Return an error if the token is invalid
        if (err) {
            console.warn(`Invalid Token: ${err.message}`);
            res.status(403).json({ message: 'Forbidden: Invalid token' });
            return;
        }
        const user = decoded as UserPayload;
        // Add the user to the request
        req.userId = user.userId;

        // Move to the next middleware
        next();
    });
};

export default authenticateToken;