"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addComment = addComment;
exports.getComments = getComments;
exports.deleteComment = deleteComment;
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../../config/database"));
const response_1 = require("../../utils/response");
async function addComment(req, res) {
    try {
        if (!req.user)
            return (0, response_1.sendError)(res, "Unauthorized", 401);
        const { article_id, content, parent_id } = req.body;
        if (!article_id || !content || content.trim().length === 0) {
            return (0, response_1.sendError)(res, "Article ID and comment content are required.", 400);
        }
        // Verify parent comment if any
        if (parent_id) {
            const parent = await (0, database_1.default)("comments").where({ id: parent_id }).first();
            if (!parent)
                return (0, response_1.sendError)(res, "Parent comment does not exist.", 404);
        }
        const commentId = (0, uuid_1.v4)();
        const newComment = {
            id: commentId,
            article_id,
            user_id: req.user.id,
            parent_id: parent_id || null,
            content,
            is_approved: true, // Auto-approve for demo/simplicity
            created_at: database_1.default.fn.now()
        };
        await (0, database_1.default)("comments").insert(newComment);
        const fetched = await (0, database_1.default)("comments as c")
            .select("c.*", "u.full_name as user_name", "u.email as user_email")
            .join("users as u", "c.user_id", "u.id")
            .where("c.id", commentId)
            .first();
        return (0, response_1.sendSuccess)(res, fetched, "Comment posted successfully.", 201);
    }
    catch (error) {
        console.error("Add Comment Error:", error);
        return (0, response_1.sendError)(res, "Failed to submit comment.", 500);
    }
}
async function getComments(req, res) {
    try {
        const { articleId } = req.query;
        if (!articleId)
            return (0, response_1.sendError)(res, "Article ID is required.", 400);
        const comments = await (0, database_1.default)("comments as c")
            .select("c.*", "u.full_name as user_name", "u.email as user_email")
            .join("users as u", "c.user_id", "u.id")
            .where({ "c.article_id": articleId, "c.is_approved": true })
            .orderBy("c.created_at", "asc");
        // Build nested tree structure
        const commentMap = new Map();
        const roots = [];
        comments.forEach(comment => {
            comment.replies = [];
            comment.user_avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.user_id}`;
            commentMap.set(comment.id, comment);
        });
        comments.forEach(comment => {
            if (comment.parent_id && commentMap.has(comment.parent_id)) {
                const parent = commentMap.get(comment.parent_id);
                parent.replies.push(comment);
            }
            else {
                roots.push(comment);
            }
        });
        return (0, response_1.sendSuccess)(res, roots);
    }
    catch (error) {
        console.error("Get Comments Error:", error);
        return (0, response_1.sendError)(res, "Failed to fetch comments.", 500);
    }
}
async function deleteComment(req, res) {
    try {
        if (!req.user)
            return (0, response_1.sendError)(res, "Unauthorized", 401);
        const { id } = req.params;
        const comment = await (0, database_1.default)("comments").where({ id }).first();
        if (!comment)
            return (0, response_1.sendError)(res, "Comment not found.", 404);
        // Only author or admin can delete
        if (comment.user_id !== req.user.id && req.user.role !== "admin") {
            return (0, response_1.sendError)(res, "Forbidden action. You do not own this comment.", 403);
        }
        await (0, database_1.default)("comments").where({ id }).delete();
        return (0, response_1.sendSuccess)(res, {}, "Comment deleted successfully.");
    }
    catch (error) {
        console.error("Delete Comment Error:", error);
        return (0, response_1.sendError)(res, "Failed to delete comment.", 500);
    }
}
