import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

export function errorHandler(error: any, req: Request, res: Response, next: NextFunction) {
  console.error("[Global Error Handler]:", error);

  const status = error.status || error.statusCode || 500;
  const message = error.message || "An unexpected system error occurred.";

  return sendError(
    res,
    message,
    status,
    process.env.NODE_ENV === "development" ? { stack: error.stack } : undefined
  );
}
