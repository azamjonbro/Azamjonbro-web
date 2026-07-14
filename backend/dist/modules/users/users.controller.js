"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookmarks = getBookmarks;
exports.toggleBookmark = toggleBookmark;
exports.getActivityLogs = getActivityLogs;
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../../config/database"));
const response_1 = require("../../utils/response");
async function getBookmarks(req, res) {
    try {
        if (!req.user)
            return (0, response_1.sendError)(res, "Unauthorized", 401);
        const bookmarks = await (0, database_1.default)("user_bookmarks")
            .where({ user_id: req.user.id })
            .orderBy("created_at", "desc");
        // Hydrate bookmark details
        const hydrated = await Promise.all(bookmarks.map(async (bk) => {
            let details = null;
            if (bk.bookmarkable_type === "article") {
                details = await (0, database_1.default)("blog_articles")
                    .select("id", "title_en", "title_uz", "title_ru", "slug", "featured_image")
                    .where({ id: bk.bookmarkable_id })
                    .first();
            }
            else if (bk.bookmarkable_type === "roadmap") {
                details = await (0, database_1.default)("saved_roadmaps")
                    .select("id", "desired_role", "current_skills", "created_at")
                    .where({ id: bk.bookmarkable_id })
                    .first();
            }
            else if (bk.bookmarkable_type === "validation") {
                details = await (0, database_1.default)("startup_validations")
                    .select("id", "idea_description", "created_at")
                    .where({ id: bk.bookmarkable_id })
                    .first();
            }
            return {
                ...bk,
                details
            };
        }));
        return (0, response_1.sendSuccess)(res, hydrated);
    }
    catch (error) {
        console.error("Get Bookmarks Error:", error);
        return (0, response_1.sendError)(res, "Failed to load bookmarks.", 500);
    }
}
async function toggleBookmark(req, res) {
    try {
        if (!req.user)
            return (0, response_1.sendError)(res, "Unauthorized", 401);
        const { bookmarkable_type, bookmarkable_id } = req.body;
        if (!bookmarkable_type || !bookmarkable_id) {
            return (0, response_1.sendError)(res, "Bookmark type and target ID are required.", 400);
        }
        const existing = await (0, database_1.default)("user_bookmarks")
            .where({
            user_id: req.user.id,
            bookmarkable_type,
            bookmarkable_id
        })
            .first();
        if (existing) {
            await (0, database_1.default)("user_bookmarks").where({ id: existing.id }).delete();
            return (0, response_1.sendSuccess)(res, { bookmarked: false }, "Bookmark removed successfully.");
        }
        else {
            await (0, database_1.default)("user_bookmarks").insert({
                id: (0, uuid_1.v4)(),
                user_id: req.user.id,
                bookmarkable_type,
                bookmarkable_id
            });
            return (0, response_1.sendSuccess)(res, { bookmarked: true }, "Bookmark saved successfully.");
        }
    }
    catch (error) {
        console.error("Toggle Bookmark Error:", error);
        return (0, response_1.sendError)(res, "Failed to modify bookmark.", 500);
    }
}
async function getActivityLogs(req, res) {
    try {
        if (!req.user)
            return (0, response_1.sendError)(res, "Unauthorized", 401);
        const logs = await (0, database_1.default)("audit_logs")
            .where({ user_id: req.user.id })
            .orderBy("created_at", "desc")
            .limit(50);
        return (0, response_1.sendSuccess)(res, logs);
    }
    catch (error) {
        console.error("Get Activity Logs Error:", error);
        return (0, response_1.sendError)(res, "Failed to load activity logs.", 500);
    }
}
