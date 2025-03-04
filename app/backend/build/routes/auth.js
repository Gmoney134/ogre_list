"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/auth.ts
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const middleware_1 = require("../middleware");
const router = express_1.default.Router();
// Register a new user
router.post('/register', controllers_1.authController.registerUser);
// Login an existing user
router.post('/login', controllers_1.authController.loginUser);
// Example of a protected route
router.get('/protected', middleware_1.authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route', userId: req.userId });
});
exports.default = router;
