import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/index.js';
import { config } from '../config/index.js';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode: number = 400, code: string = 'BAD_REQUEST', details?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  const statusCode = err.statusCode || (err.status ? Number(err.status) : 500);
  const errorCode = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR');
  const message = statusCode === 500 && config.isProduction ? 'An unexpected error occurred. Please try again later.' : err.message || 'Unknown error';

  if (statusCode === 500) {
    console.error(`[Server Error ${req.method} ${req.path}]:`, err);
  }

  const response: ApiResponse = {
    success: false,
    error: {
      code: errorCode,
      message,
      ...(err.details ? { details: err.details } : {}),
    },
  };

  res.status(statusCode).json(response);
}
