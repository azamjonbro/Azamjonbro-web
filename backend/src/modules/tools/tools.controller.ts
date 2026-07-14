import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import db from "../../config/database";
import { sendSuccess, sendError } from "../../utils/response";
import { AuthenticatedRequest } from "../../middlewares/auth";

export async function logToolUsage(req: AuthenticatedRequest, res: Response) {
  try {
    const { tool_type, input_summary, output_summary, guest_fingerprint } = req.body;

    if (!tool_type || !guest_fingerprint) {
      return sendError(res, "Tool type and fingerprint are required.", 400);
    }

    const logId = uuidv4();
    await db("tool_history").insert({
      id: logId,
      user_id: req.user ? req.user.id : null,
      guest_fingerprint,
      tool_type,
      input_data: JSON.stringify(input_summary || {}),
      output_data: JSON.stringify(output_summary || {}),
      created_at: db.fn.now()
    });

    return sendSuccess(res, { id: logId }, "Tool activity logged.");
  } catch (error) {
    console.error("Log Tool Usage Error:", error);
    return sendError(res, "Failed to log tool usage.", 500);
  }
}

export async function getToolHistory(req: AuthenticatedRequest, res: Response) {
  try {
    const { fingerprint } = req.query;

    let query = db("tool_history").orderBy("created_at", "desc").limit(30);

    if (req.user) {
      query = query.where({ user_id: req.user.id });
    } else if (fingerprint) {
      query = query.where({ guest_fingerprint: fingerprint as string });
    } else {
      return sendSuccess(res, [], "No identifiers provided.");
    }

    const history = await query;
    const hydrated = history.map(item => ({
      ...item,
      input_data: item.input_data ? JSON.parse(item.input_data) : {},
      output_data: item.output_data ? JSON.parse(item.output_data) : {}
    }));

    return sendSuccess(res, hydrated);
  } catch (error) {
    console.error("Get Tool History Error:", error);
    return sendError(res, "Failed to fetch tool history.", 500);
  }
}

export async function clearToolHistory(req: AuthenticatedRequest, res: Response) {
  try {
    const { fingerprint } = req.body;

    let query = db("tool_history");

    if (req.user) {
      query = query.where({ user_id: req.user.id });
    } else if (fingerprint) {
      query = query.where({ guest_fingerprint: fingerprint });
    } else {
      return sendError(res, "Missing identification parameter.", 400);
    }

    await query.delete();
    return sendSuccess(res, {}, "History cleared successfully.");
  } catch (error) {
    console.error("Clear Tool History Error:", error);
    return sendError(res, "Failed to clear history.", 500);
  }
}

export async function formatSql(req: Request, res: Response) {
  try {
    const { sql } = req.body;
    if (!sql) return sendError(res, "SQL payload is required.", 400);

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
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      .join("\n  ")
      .replace(/^  (SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)/i, "$1");

    return sendSuccess(res, { formatted });
  } catch (error) {
    console.error("Format SQL Error:", error);
    return sendError(res, "Failed to format SQL.", 500);
  }
}

export async function testApi(req: Request, res: Response) {
  try {
    const { url, method, headers, body } = req.body;

    if (!url) return sendError(res, "URL parameter is required.", 400);

    const startTime = Date.now();
    const response = await axios({
      url,
      method: method || "GET",
      headers: headers || {},
      data: body || undefined,
      validateStatus: () => true, // resolve promise for any status code
      timeout: 10000 // 10s timeout
    });
    const duration = Date.now() - startTime;

    return sendSuccess(res, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      durationMs: duration
    });
  } catch (error: any) {
    console.error("Test API Proxy Error:", error.message);
    return sendError(res, `API request failed: ${error.message}`, 500);
  }
}
