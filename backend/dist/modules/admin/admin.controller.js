"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = getDashboardStats;
exports.getUsers = getUsers;
exports.updateUserRole = updateUserRole;
exports.toggleUserStatus = toggleUserStatus;
exports.getSystemLogs = getSystemLogs;
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../../config/database"));
const response_1 = require("../../utils/response");
async function getDashboardStats(req, res) {
    try {
        const totalUsersResult = await (0, database_1.default)("users").count("id as count").first();
        const activeUsersResult = await (0, database_1.default)("users").where({ is_active: true }).count("id as count").first();
        const totalArticlesResult = await (0, database_1.default)("blog_articles").count("id as count").first();
        // Sum views
        const totalViewsResult = await (0, database_1.default)("blog_articles").sum("views_count as count").first();
        // Group tools usage
        const popularTools = await (0, database_1.default)("tool_history")
            .select("tool_type")
            .count("id as count")
            .groupBy("tool_type")
            .orderBy("count", "desc")
            .limit(5);
        // Dynamic charts dataset
        const signupsTrend = await (0, database_1.default)("users")
            .select(database_1.default.raw("DATE(created_at) as date"))
            .count("id as count")
            .groupBy(database_1.default.raw("DATE(created_at)"))
            .orderBy("date", "asc")
            .limit(7);
        return (0, response_1.sendSuccess)(res, {
            totalUsers: Number(totalUsersResult?.count || 0),
            activeUsers: Number(activeUsersResult?.count || 0),
            totalArticles: Number(totalArticlesResult?.count || 0),
            totalViews: Number(totalViewsResult?.count || 0),
            popularTools,
            signupsTrend,
            systemHealth: {
                status: "healthy",
                uptimeSeconds: process.uptime(),
                memoryUsage: process.memoryUsage(),
                dbClient: database_1.default.client.config.client
            }
        });
    }
    catch (error) {
        console.error("Get Admin Stats Error:", error);
        return (0, response_1.sendError)(res, "Failed to compile admin stats.", 500);
    }
}
async function getUsers(req, res) {
    try {
        const users = await (0, database_1.default)("users")
            .select("id", "email", "full_name", "role", "is_active", "created_at")
            .orderBy("created_at", "desc");
        return (0, response_1.sendSuccess)(res, users);
    }
    catch (error) {
        console.error("Get Admin Users Error:", error);
        return (0, response_1.sendError)(res, "Failed to load user records.", 500);
    }
}
async function updateUserRole(req, res) {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!role || !["user", "admin"].includes(role)) {
            return (0, response_1.sendError)(res, "Invalid role parameter.", 400);
        }
        if (id === req.user?.id) {
            return (0, response_1.sendError)(res, "You cannot modify your own administrative role.", 403);
        }
        await (0, database_1.default)("users").where({ id }).update({ role, updated_at: database_1.default.fn.now() });
        // Log administrative override action
        await (0, database_1.default)("audit_logs").insert({
            id: (0, uuid_1.v4)(),
            user_id: req.user?.id,
            action: "ADMIN_CHANGE_ROLE",
            ip_address: req.ip || null,
            user_agent: req.headers["user-agent"] || null,
            payload: JSON.stringify({ targetUserId: id, role })
        });
        return (0, response_1.sendSuccess)(res, {}, "User role updated successfully.");
    }
    catch (error) {
        console.error("Update Role Error:", error);
        return (0, response_1.sendError)(res, "Failed to update user role.", 500);
    }
}
async function toggleUserStatus(req, res) {
    try {
        const { id } = req.params;
        const { is_active } = req.body;
        if (is_active === undefined)
            return (0, response_1.sendError)(res, "Status value is required.", 400);
        if (id === req.user?.id)
            return (0, response_1.sendError)(res, "You cannot deactivate yourself.", 403);
        await (0, database_1.default)("users").where({ id }).update({ is_active, updated_at: database_1.default.fn.now() });
        // Log administrative action
        await (0, database_1.default)("audit_logs").insert({
            id: (0, uuid_1.v4)(),
            user_id: req.user?.id,
            action: is_active ? "ADMIN_ACTIVATE_USER" : "ADMIN_DEACTIVATE_USER",
            ip_address: req.ip || null,
            user_agent: req.headers["user-agent"] || null,
            payload: JSON.stringify({ targetUserId: id })
        });
        return (0, response_1.sendSuccess)(res, {}, "User account status updated.");
    }
    catch (error) {
        console.error("Toggle User Status Error:", error);
        return (0, response_1.sendError)(res, "Failed to change user status.", 500);
    }
}
async function getSystemLogs(req, res) {
    try {
        const logs = await (0, database_1.default)("audit_logs as l")
            .select("l.*", "u.email as user_email")
            .leftJoin("users as u", "l.user_id", "u.id")
            .orderBy("l.created_at", "desc")
            .limit(100);
        return (0, response_1.sendSuccess)(res, logs);
    }
    catch (error) {
        console.error("Get Audit Logs Error:", error);
        return (0, response_1.sendError)(res, "Failed to retrieve audit logs.", 500);
    }
}
