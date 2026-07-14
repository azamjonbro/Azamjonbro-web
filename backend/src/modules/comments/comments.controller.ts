import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../../config/database";
import { sendSuccess, sendError } from "../../utils/response";
import { AuthenticatedRequest } from "../../middlewares/auth";

export async function addComment(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, "Unauthorized", 401);
    const { article_id, content, parent_id } = req.body;

    if (!article_id || !content || content.trim().length === 0) {
      return sendError(res, "Article ID and comment content are required.", 400);
    }

    // Verify parent comment if any
    if (parent_id) {
      const parent = await db("comments").where({ id: parent_id }).first();
      if (!parent) return sendError(res, "Parent comment does not exist.", 404);
    }

    const commentId = uuidv4();
    const newComment = {
      id: commentId,
      article_id,
      user_id: req.user.id,
      parent_id: parent_id || null,
      content,
      is_approved: true, // Auto-approve for demo/simplicity
      created_at: db.fn.now()
    };

    await db("comments").insert(newComment);

    const fetched = await db("comments as c")
      .select("c.*", "u.full_name as user_name", "u.email as user_email")
      .join("users as u", "c.user_id", "u.id")
      .where("c.id", commentId)
      .first();

    return sendSuccess(res, fetched, "Comment posted successfully.", 201);
  } catch (error) {
    console.error("Add Comment Error:", error);
    return sendError(res, "Failed to submit comment.", 500);
  }
}

export async function getComments(req: AuthenticatedRequest, res: Response) {
  try {
    const { articleId } = req.query;
    if (!articleId) return sendError(res, "Article ID is required.", 400);

    const comments = await db("comments as c")
      .select("c.*", "u.full_name as user_name", "u.email as user_email")
      .join("users as u", "c.user_id", "u.id")
      .where({ "c.article_id": articleId as string, "c.is_approved": true })
      .orderBy("c.created_at", "asc");

    // Build nested tree structure
    const commentMap = new Map<string, any>();
    const roots: any[] = [];

    comments.forEach(comment => {
      comment.replies = [];
      comment.user_avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.user_id}`;
      commentMap.set(comment.id, comment);
    });

    comments.forEach(comment => {
      if (comment.parent_id && commentMap.has(comment.parent_id)) {
        const parent = commentMap.get(comment.parent_id);
        parent.replies.push(comment);
      } else {
        roots.push(comment);
      }
    });

    return sendSuccess(res, roots);
  } catch (error) {
    console.error("Get Comments Error:", error);
    return sendError(res, "Failed to fetch comments.", 500);
  }
}

export async function deleteComment(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, "Unauthorized", 401);
    const { id } = req.params;

    const comment = await db("comments").where({ id }).first();
    if (!comment) return sendError(res, "Comment not found.", 404);

    // Only author or admin can delete
    if (comment.user_id !== req.user.id && req.user.role !== "admin") {
      return sendError(res, "Forbidden action. You do not own this comment.", 403);
    }

    await db("comments").where({ id }).delete();
    return sendSuccess(res, {}, "Comment deleted successfully.");
  } catch (error) {
    console.error("Delete Comment Error:", error);
    return sendError(res, "Failed to delete comment.", 500);
  }
}
