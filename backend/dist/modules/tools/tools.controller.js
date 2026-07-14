"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logToolUsage = logToolUsage;
exports.getToolHistory = getToolHistory;
exports.clearToolHistory = clearToolHistory;
exports.formatSql = formatSql;
exports.testApi = testApi;
const uuid_1 = require("uuid");
const axios_1 = __importDefault(require("axios"));
const database_1 = __importDefault(require("../../config/database"));
const response_1 = require("../../utils/response");
async function logToolUsage(req, res) {
    try {
        const { tool_type, input_summary, output_summary, guest_fingerprint } = req.body;
        if (!tool_type || !guest_fingerprint) {
            return (0, response_1.sendError)(res, "Tool type and fingerprint are required.", 400);
        }
        const logId = (0, uuid_1.v4)();
        await (0, database_1.default)("tool_history").insert({
            id: logId,
            user_id: req.user ? req.user.id : null,
            guest_fingerprint,
            tool_type,
            input_data: JSON.stringify(input_summary || {}),
            output_data: JSON.stringify(output_summary || {}),
            created_at: database_1.default.fn.now()
        });
        return (0, response_1.sendSuccess)(res, { id: logId }, "Tool activity logged.");
    }
    catch (error) {
        console.error("Log Tool Usage Error:", error);
        return (0, response_1.sendError)(res, "Failed to log tool usage.", 500);
    }
}
async function getToolHistory(req, res) {
    try {
        const { fingerprint } = req.query;
        let query = (0, database_1.default)("tool_history").orderBy("created_at", "desc").limit(30);
        if (req.user) {
            query = query.where({ user_id: req.user.id });
        }
        else if (fingerprint) {
            query = query.where({ guest_fingerprint: fingerprint });
        }
        else {
            return (0, response_1.sendSuccess)(res, [], "No identifiers provided.");
        }
        const history = await query;
        const hydrated = history.map(item => ({
            ...item,
            input_data: item.input_data ? JSON.parse(item.input_data) : {},
            output_data: item.output_data ? JSON.parse(item.output_data) : {}
        }));
        return (0, response_1.sendSuccess)(res, hydrated);
    }
    catch (error) {
        console.error("Get Tool History Error:", error);
        return (0, response_1.sendError)(res, "Failed to fetch tool history.", 500);
    }
}
async function clearToolHistory(req, res) {
    try {
        const { fingerprint } = req.body;
        let query = (0, database_1.default)("tool_history");
        if (req.user) {
            query = query.where({ user_id: req.user.id });
        }
        else if (fingerprint) {
            query = query.where({ guest_fingerprint: fingerprint });
        }
        else {
            return (0, response_1.sendError)(res, "Missing identification parameter.", 400);
        }
        await query.delete();
        return (0, response_1.sendSuccess)(res, {}, "History cleared successfully.");
    }
    catch (error) {
        console.error("Clear Tool History Error:", error);
        return (0, response_1.sendError)(res, "Failed to clear history.", 500);
    }
}
async function formatSql(req, res) {
    try {
        const { sql } = req.body;
        if (!sql)
            return (0, response_1.sendError)(res, "SQL payload is required.", 400);
        // Simple custom regex SQL beautifier (upper-cases keywords, aligns queries)
        const keywords = [
            "SELECT", "FROM", "WHERE", "AND", "OR", "JOIN", "ON", "GROUP BY", "ORDER BY",
            "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM", "LEFT JOIN", "RIGHT JOIN",
            "INNER JOIN", "HAVING", "LIMIT", "CREATE TABLE", "ALTER TABLE", "DROP TABLE"
        ];
        let formatted = sql.replace(/\s+/g, " ").trim();
        // Uppercase all main query keyword matches
        for (const kw of keywords) {
            const regex = new RegExp(`\\b${kw}\\b`, "gi");
            formatted = formatted.replace(regex, kw);
        }
        // Line breaks before keywords
        const breaks = ["SELECT", "FROM", "WHERE", "JOIN", "LEFT JOIN", "RIGHT JOIN", "GROUP BY", "ORDER BY", "SET", "VALUES"];
        for (const br of breaks) {
            const regex = new RegExp(`\\b${br}\\b`, "g");
            formatted = formatted.replace(regex, `\n${br}`);
        }
        // Align indentation
        formatted = formatted
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .join("\n  ")
            .replace(/^  (SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)/i, "$1");
        return (0, response_1.sendSuccess)(res, { formatted });
    }
    catch (error) {
        console.error("Format SQL Error:", error);
        return (0, response_1.sendError)(res, "Failed to format SQL.", 500);
    }
}
async function testApi(req, res) {
    try {
        const { url, method, headers, body } = req.body;
        if (!url)
            return (0, response_1.sendError)(res, "URL parameter is required.", 400);
        const startTime = Date.now();
        const response = await (0, axios_1.default)({
            url,
            method: method || "GET",
            headers: headers || {},
            data: body || undefined,
            validateStatus: () => true, // resolve promise for any status code
            timeout: 10000 // 10s timeout
        });
        const duration = Date.now() - startTime;
        return (0, response_1.sendSuccess)(res, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            data: response.data,
            durationMs: duration
        });
    }
    catch (error) {
        console.error("Test API Proxy Error:", error.message);
        return (0, response_1.sendError)(res, `API request failed: ${error.message}`, 500);
    }
}
