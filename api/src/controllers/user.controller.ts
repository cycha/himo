import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { SignupDto, LoginDto } from '../types/search.dto';
import { AuthRequest } from '../middleware/auth';

export class UserController {
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signupDto: SignupDto = req.body;

      const { user, token } = await userService.signup(signupDto);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          id: user._id,
          email: user.email,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loginDto: LoginDto = req.body;

      const { user, token } = await userService.login(loginDto);

      res.status(200).json({
        success: true,
        message: 'Authentication successful',
        data: {
          id: user._id,
          email: user.email,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      const user = await userService.getUserById(req.user.id);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: user._id,
          email: user.email,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
