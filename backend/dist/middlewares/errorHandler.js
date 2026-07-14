"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const response_1 = require("../utils/response");
function errorHandler(error, req, res, next) {
    console.error("[Global Error Handler]:", error);
    const status = error.status || error.statusCode || 500;
    const message = error.message || "An unexpected system error occurred.";
    return (0, response_1.sendError)(res, message, status, process.env.NODE_ENV === "development" ? { stack: error.stack } : undefined);
}
