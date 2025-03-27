import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface CustomRequest extends Request {
    userId?: number;
}

const verifyToken = (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const jwtPayload = decoded as JwtPayload; // add this line

        if (jwtPayload && typeof jwtPayload !== 'string' && jwtPayload.userId) { // Check for JwtPayload and userId
            req.userId = jwtPayload.userId;
            next();
        } else {
            return res.status(403).json({ message: 'Forbidden' });
        }
    });
};

export default verifyToken;