import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
    return;
  }
  
  next();
};

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Prisma unique constraint error
  if (err.name === 'PrismaClientKnownRequestError' && (err as any).code === 'P2002') {
    res.status(409).json({
      error: 'Duplicate entry',
      message: 'A record with this value already exists',
    });
    return;
  }

  // Prisma validation error
  if (err.name === 'PrismaClientValidationError') {
    res.status(400).json({
      error: 'Validation error',
      message: err.message,
    });
    return;
  }

  // Default error
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
