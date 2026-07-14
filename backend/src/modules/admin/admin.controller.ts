import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../../config/database";
import { sendSuccess, sendError } from "../../utils/response";
import { AuthenticatedRequest } from "../../middlewares/auth";

export async function getDashboardStats(req: AuthenticatedRequest, res: Response) {
  try {
    const totalUsersResult = await db("users").count("id as count").first();
    const activeUsersResult = await db("users").where({ is_active: true }).count("id as count").first();
    const totalArticlesResult = await db("blog_articles").count("id as count").first();
    
    // Sum views
    const totalViewsResult = await db("blog_articles").sum("views_count as count").first();

    // Group tools usage
    const popularTools = await db("tool_history")
      .select("tool_type")
      .count("id as count")
      .groupBy("tool_type")
      .orderBy("count", "desc")
      .limit(5);

    // Dynamic charts dataset
    const signupsTrend = await db("users")
      .select(db.raw("DATE(created_at) as date"))
      .count("id as count")
      .groupBy(db.raw("DATE(created_at)"))
      .orderBy("date", "asc")
      .limit(7);

    return sendSuccess(res, {
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
        dbClient: db.client.config.client
      }
    });
  } catch (error) {
    console.error("Get Admin Stats Error:", error);
    return sendError(res, "Failed to compile admin stats.", 500);
  }
}

export async function getUsers(req: AuthenticatedRequest, res: Response) {
  try {
    const users = await db("users")
      .select("id", "email", "full_name", "role", "is_active", "created_at")
      .orderBy("created_at", "desc");
    
    return sendSuccess(res, users);
  } catch (error) {
    console.error("Get Admin Users Error:", error);
    return sendError(res, "Failed to load user records.", 500);
  }
}

export async function updateUserRole(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !["user", "admin"].includes(role)) {
      return sendError(res, "Invalid role parameter.", 400);
    }

    if (id === req.user?.id) {
      return sendError(res, "You cannot modify your own administrative role.", 403);
    }

    await db("users").where({ id }).update({ role, updated_at: db.fn.now() });

    // Log administrative override action
    await db("audit_logs").insert({
      id: uuidv4(),
      user_id: req.user?.id,
      action: "ADMIN_CHANGE_ROLE",
      ip_address: req.ip || null,
      user_agent: req.headers["user-agent"] || null,
      payload: JSON.stringify({ targetUserId: id, role })
    });

    return sendSuccess(res, {}, "User role updated successfully.");
  } catch (error) {
    console.error("Update Role Error:", error);
    return sendError(res, "Failed to update user role.", 500);
  }
}

export async function toggleUserStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (is_active === undefined) return sendError(res, "Status value is required.", 400);
    if (id === req.user?.id) return sendError(res, "You cannot deactivate yourself.", 403);

    await db("users").where({ id }).update({ is_active, updated_at: db.fn.now() });

    // Log administrative action
    await db("audit_logs").insert({
      id: uuidv4(),
      user_id: req.user?.id,
      action: is_active ? "ADMIN_ACTIVATE_USER" : "ADMIN_DEACTIVATE_USER",
      ip_address: req.ip || null,
      user_agent: req.headers["user-agent"] || null,
      payload: JSON.stringify({ targetUserId: id })
    });

    return sendSuccess(res, {}, "User account status updated.");
  } catch (error) {
    console.error("Toggle User Status Error:", error);
    return sendError(res, "Failed to change user status.", 500);
  }
}

export async function getSystemLogs(req: AuthenticatedRequest, res: Response) {
  try {
    const logs = await db("audit_logs as l")
      .select("l.*", "u.email as user_email")
      .leftJoin("users as u", "l.user_id", "u.id")
      .orderBy("l.created_at", "desc")
      .limit(100);

    return sendSuccess(res, logs);
  } catch (error) {
    console.error("Get Audit Logs Error:", error);
    return sendError(res, "Failed to retrieve audit logs.", 500);
  }
}
