"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
// src/middleware/index.ts
var authMiddleware_1 = require("./authMiddleware");
Object.defineProperty(exports, "authenticateToken", { enumerable: true, get: function () { return __importDefault(authMiddleware_1).default; } });
