"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
function sendSuccess(res, data, message, status = 200, meta) {
    return res.status(status).json({
        success: true,
        data,
        message,
        meta
    });
}
function sendError(res, message, status = 400, data) {
    return res.status(status).json({
        success: false,
        message,
        data
    });
}
