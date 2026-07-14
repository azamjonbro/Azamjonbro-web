import { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    [key: string]: any;
  };
}

export function sendSuccess(res: Response, data: any, message?: string, status = 200, meta?: any) {
  return res.status(status).json({
    success: true,
    data,
    message,
    meta
  });
}

export function sendError(res: Response, message: string, status = 400, data?: any) {
  return res.status(status).json({
    success: false,
    message,
    data
  });
}
