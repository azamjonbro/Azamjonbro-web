import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendError } from "../utils/response";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "Access Denied. No token provided.", 401);
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "super_secret_access_token_key_12345") as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch (error) {
    return sendError(res, "Invalid or expired token.", 403);
  }
}

export function optionalAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "super_secret_access_token_key_12345") as any;
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
    } catch (e) {
      // Ignore token decoding failure for optional verification
    }
  }
  next();
}

export function rbacMiddleware(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, "Access Denied. Unauthorized.", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, "Access Denied. Insufficient permissions.", 403);
    }

    next();
  };
}
