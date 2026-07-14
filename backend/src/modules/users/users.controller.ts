import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../../config/database";
import { sendSuccess, sendError } from "../../utils/response";
import { AuthenticatedRequest } from "../../middlewares/auth";

export async function getBookmarks(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, "Unauthorized", 401);

    const bookmarks = await db("user_bookmarks")
      .where({ user_id: req.user.id })
      .orderBy("created_at", "desc");

    // Hydrate bookmark details
    const hydrated = await Promise.all(bookmarks.map(async (bk) => {
      let details: any = null;
      if (bk.bookmarkable_type === "article") {
        details = await db("blog_articles")
          .select("id", "title_en", "title_uz", "title_ru", "slug", "featured_image")
          .where({ id: bk.bookmarkable_id })
          .first();
      } else if (bk.bookmarkable_type === "roadmap") {
        details = await db("saved_roadmaps")
          .select("id", "desired_role", "current_skills", "created_at")
          .where({ id: bk.bookmarkable_id })
          .first();
      } else if (bk.bookmarkable_type === "validation") {
        details = await db("startup_validations")
          .select("id", "idea_description", "created_at")
          .where({ id: bk.bookmarkable_id })
          .first();
      }
      return {
        ...bk,
        details
      };
    }));

    return sendSuccess(res, hydrated);
  } catch (error) {
    console.error("Get Bookmarks Error:", error);
    return sendError(res, "Failed to load bookmarks.", 500);
  }
}

export async function toggleBookmark(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, "Unauthorized", 401);
    const { bookmarkable_type, bookmarkable_id } = req.body;

    if (!bookmarkable_type || !bookmarkable_id) {
      return sendError(res, "Bookmark type and target ID are required.", 400);
    }

    const existing = await db("user_bookmarks")
      .where({
        user_id: req.user.id,
        bookmarkable_type,
        bookmarkable_id
      })
      .first();

    if (existing) {
      await db("user_bookmarks").where({ id: existing.id }).delete();
      return sendSuccess(res, { bookmarked: false }, "Bookmark removed successfully.");
    } else {
      await db("user_bookmarks").insert({
        id: uuidv4(),
        user_id: req.user.id,
        bookmarkable_type,
        bookmarkable_id
      });
      return sendSuccess(res, { bookmarked: true }, "Bookmark saved successfully.");
    }
  } catch (error) {
    console.error("Toggle Bookmark Error:", error);
    return sendError(res, "Failed to modify bookmark.", 500);
  }
}

export async function getActivityLogs(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return sendError(res, "Unauthorized", 401);

    const logs = await db("audit_logs")
      .where({ user_id: req.user.id })
      .orderBy("created_at", "desc")
      .limit(50);

    return sendSuccess(res, logs);
  } catch (error) {
    console.error("Get Activity Logs Error:", error);
    return sendError(res, "Failed to load activity logs.", 500);
  }
}
