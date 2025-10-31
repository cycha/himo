import { User, IUser } from '@himo/commons';
import { SignupDto, LoginDto } from '../types/search.dto';
import { AppError } from '../middleware/error-handler';

export class UserService {
  async signup(signupDto: SignupDto): Promise<{ user: IUser; token: string }> {
    const { email, password } = signupDto;

    // Check if user already exists
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      throw new AppError(409, 'A user with this email already exists');
    }

    // Create new user (password will be hashed by pre-save hook)
    const user = new User({ email, password });
    await user.save();

    // Generate JWT token
    const token = user.getToken();

    return {
      user,
      token,
    };
  }

  async login(loginDto: LoginDto): Promise<{ user: IUser; token: string }> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await User.findOne({ email }).exec();
    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await user.authenticate(password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Generate JWT token
    const token = user.getToken();

    return {
      user,
      token,
    };
  }

  async getUserById(id: string): Promise<any | null> {
    return User.findById(id).select('-password').lean().exec();
  }

  async getUserByEmail(email: string): Promise<any | null> {
    return User.findOne({ email }).exec();
  }
}

export const userService = new UserService();
