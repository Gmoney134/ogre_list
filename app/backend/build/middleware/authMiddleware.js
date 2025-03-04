"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/middleware/authMiddleware.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables.
dotenv_1.default.config();
const authenticateToken = (req, res, next) => {
    // Get the token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    // Return an error if there is no token
    if (!token) {
        res.status(401).json({ message: 'Unauthorized: No token provided' });
        return;
    }
    // Verify the token
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, decoded) => {
        // Return an error if the token is invalid
        if (err) {
            console.warn(`Invalid Token: ${err.message}`);
            res.status(403).json({ message: 'Forbidden: Invalid token' });
            return;
        }
        const user = decoded;
        // Add the user to the request
        req.userId = user.userId;
        // Move to the next middleware
        next();
    });
};
exports.default = authenticateToken;
