"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.optionalAuthMiddleware = optionalAuthMiddleware;
exports.rbacMiddleware = rbacMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const response_1 = require("../utils/response");
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return (0, response_1.sendError)(res, "Access Denied. No token provided.", 401);
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "super_secret_access_token_key_12345");
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };
        next();
    }
    catch (error) {
        return (0, response_1.sendError)(res, "Invalid or expired token.", 403);
    }
}
function optionalAuthMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "super_secret_access_token_key_12345");
            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role
            };
        }
        catch (e) {
            // Ignore token decoding failure for optional verification
        }
    }
    next();
}
function rbacMiddleware(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return (0, response_1.sendError)(res, "Access Denied. Unauthorized.", 401);
        }
        if (!allowedRoles.includes(req.user.role)) {
            return (0, response_1.sendError)(res, "Access Denied. Insufficient permissions.", 403);
        }
        next();
    };
}
