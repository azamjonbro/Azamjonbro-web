"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiterMiddleware = rateLimiterMiddleware;
const response_1 = require("../utils/response");
const requestCounts = new Map();
/**
 * IP rate limiter helper
 * @param limit maximum requests allowed in the time window
 * @param windowMs time window in milliseconds (default 15 minutes)
 */
function rateLimiterMiddleware(limit = 100, windowMs = 15 * 60 * 1000) {
    return (req, res, next) => {
        // Exclude basic health checks or assets if necessary, otherwise limit all API calls
        const ip = req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown";
        const now = Date.now();
        const clientData = requestCounts.get(ip);
        if (!clientData || now > clientData.resetTime) {
            requestCounts.set(ip, {
                count: 1,
                resetTime: now + windowMs
            });
            return next();
        }
        clientData.count++;
        if (clientData.count > limit) {
            res.setHeader("Retry-After", Math.ceil((clientData.resetTime - now) / 1000));
            return (0, response_1.sendError)(res, "Too many requests. Please try again later.", 429);
        }
        next();
    };
}
