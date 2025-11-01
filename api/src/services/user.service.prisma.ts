import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository.prisma';
import { SignupDto, LoginDto, AuthResponseDto, UserResponseDto } from '../dtos/user.dto';
import { AppError } from '../middleware/error-handler';

export interface IUserService {
  signup(signupDto: SignupDto): Promise<AuthResponseDto>;
  login(loginDto: LoginDto): Promise<AuthResponseDto>;
  getUserById(id: string): Promise<UserResponseDto | null>;
}

export class UserServicePrisma implements IUserService {
  constructor(private readonly repository = userRepository) {}

  async signup(signupDto: SignupDto): Promise<AuthResponseDto> {
    const { email, password } = signupDto;

    // Check if user already exists
    const exists = await this.repository.exists(email);
    if (exists) {
      throw new AppError(409, 'A user with this email already exists');
    }

    // Create new user (password will be hashed in repository)
    const user = await this.repository.create({ email, password });

    // Generate JWT token
    const token = this.generateToken(user.id, user.email);

    return {
      success: true,
      message: 'User created successfully',
      data: {
        id: user.id,
        email: user.email,
        token,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user by email (with password for authentication)
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await this.repository.verifyPassword(user, password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken(user.id, user.email);

    return {
      success: true,
      message: 'Authentication successful',
      data: {
        id: user.id,
        email: user.email,
        token,
      },
    };
  }

  async getUserById(id: string): Promise<UserResponseDto | null> {
    const user = await this.repository.findById(id);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      created_at: user.createdAt,
    };
  }

  private generateToken(id: string, email: string): string {
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    
    const payload = {
      id,
      email,
    };

    return jwt.sign(payload, secret, { expiresIn });
  }
}

export const userService = new UserServicePrisma();
