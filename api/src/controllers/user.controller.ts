import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { SignupDto, LoginDto } from '../dtos/user.dto';
import { AuthRequest } from '../middleware/auth';

export class UserController {
  constructor(private readonly service = userService) {}

  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signupDto: SignupDto = req.body;
      const result = await this.service.signup(signupDto);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loginDto: LoginDto = req.body;
      const result = await this.service.login(loginDto);
      res.status(200).json(result);
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

      const user = await this.service.getUserById(req.user.id);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
