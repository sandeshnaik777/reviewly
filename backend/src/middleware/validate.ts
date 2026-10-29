import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from './errorHandler.js';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = err.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        }));
        const summary = issues.map((i) => `${i.path ? i.path + ': ' : ''}${i.message}`).join(', ');
        return next(new AppError(`Validation error: ${summary}`, 400, 'VALIDATION_ERROR', issues));
      }
      next(err);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = err.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        }));
        const summary = issues.map((i) => `${i.path ? i.path + ': ' : ''}${i.message}`).join(', ');
        return next(new AppError(`Validation error in query parameters: ${summary}`, 400, 'VALIDATION_ERROR', issues));
      }
      next(err);
    }
  };
}
