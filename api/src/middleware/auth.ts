import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Please provide a valid Bearer token',
      });
      return;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    try {
      const decoded = jwt.verify(token, secret) as { id: string; email: string };
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({
        error: 'Invalid token',
        message: 'The provided token is invalid or expired',
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Authentication error',
      message: 'An error occurred during authentication',
    });
  }
};
