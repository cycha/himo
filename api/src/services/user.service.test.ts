import { UserServicePrisma } from './user.service';
import { createTestUser, cleanDatabase } from '../__tests__/helpers/testDb';
import { AppError } from '../middleware/error-handler';
import jwt from 'jsonwebtoken';

describe('UserService', () => {
  let userService: UserServicePrisma;

  beforeAll(() => {
    userService = new UserServicePrisma();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('signup', () => {
    it('should create a new user and return token', async () => {
      const signupDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await userService.signup(signupDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('User created successfully');
      expect(result.data.id).toBeDefined();
      expect(result.data.email).toBe('test@example.com');
      expect(result.data.token).toBeDefined();

      // Verify token is valid
      const decoded = jwt.decode(result.data.token) as any;
      expect(decoded.id).toBe(result.data.id);
      expect(decoded.email).toBe('test@example.com');
    });

    it('should throw error when email already exists', async () => {
      await createTestUser({ email: 'test@example.com' });

      const signupDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      await expect(userService.signup(signupDto)).rejects.toThrow(AppError);
      await expect(userService.signup(signupDto)).rejects.toThrow(
        'A user with this email already exists'
      );
    });

    it('should throw 409 status code for duplicate email', async () => {
      await createTestUser({ email: 'test@example.com' });

      const signupDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      try {
        await userService.signup(signupDto);
        fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(409);
      }
    });

    it('should handle email case-insensitively', async () => {
      await createTestUser({ email: 'test@example.com' });

      const signupDto = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      };

      await expect(userService.signup(signupDto)).rejects.toThrow(
        'A user with this email already exists'
      );
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // Create test user with known password
      const signupDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      await userService.signup(signupDto);
    });

    it('should authenticate user with correct credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await userService.login(loginDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Authentication successful');
      expect(result.data.email).toBe('test@example.com');
      expect(result.data.token).toBeDefined();

      // Verify token
      const decoded = jwt.decode(result.data.token) as any;
      expect(decoded.email).toBe('test@example.com');
    });

    it('should throw error for non-existent email', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      await expect(userService.login(loginDto)).rejects.toThrow(AppError);
      await expect(userService.login(loginDto)).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for incorrect password', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(userService.login(loginDto)).rejects.toThrow(AppError);
      await expect(userService.login(loginDto)).rejects.toThrow('Invalid email or password');
    });

    it('should throw 401 status code for invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      try {
        await userService.login(loginDto);
        fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(401);
      }
    });

    it('should handle email case-insensitively', async () => {
      const loginDto = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      };

      const result = await userService.login(loginDto);

      expect(result.success).toBe(true);
      expect(result.data.email).toBe('test@example.com');
    });

    it('should generate different tokens on each login', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result1 = await userService.login(loginDto);

      // Wait a bit to ensure different issued-at time
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const result2 = await userService.login(loginDto);

      expect(result1.data.token).not.toBe(result2.data.token);
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      const createdUser = await createTestUser({ email: 'test@example.com' });

      const user = await userService.getUserById(createdUser.id);

      expect(user).toBeDefined();
      expect(user?.id).toBe(createdUser.id);
      expect(user?.email).toBe('test@example.com');
      expect(user?.created_at).toBeInstanceOf(Date);
    });

    it('should not include password in response', async () => {
      const createdUser = await createTestUser({ email: 'test@example.com' });

      const user = await userService.getUserById(createdUser.id);

      expect(user).not.toHaveProperty('password');
    });

    it('should return null for non-existent user', async () => {
      const user = await userService.getUserById('non-existent-id');

      expect(user).toBeNull();
    });
  });

  describe('generateToken', () => {
    it('should generate valid JWT token', async () => {
      const signupDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await userService.signup(signupDto);
      const token = result.data.token;

      // Verify token can be decoded
      const decoded = jwt.decode(token) as any;
      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(result.data.id);
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.exp).toBeDefined(); // Token has expiration
      expect(decoded.iat).toBeDefined(); // Token has issued-at time
    });

    it('should generate token with correct secret', async () => {
      const signupDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await userService.signup(signupDto);
      const token = result.data.token;

      const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

      // Verify token with secret
      const decoded = jwt.verify(token, secret) as any;
      expect(decoded.email).toBe('test@example.com');
    });
  });

  describe('integration scenarios', () => {
    it('should allow signup and immediate login', async () => {
      // Signup
      const signupDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const signupResult = await userService.signup(signupDto);

      expect(signupResult.success).toBe(true);

      // Login immediately
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const loginResult = await userService.login(loginDto);

      expect(loginResult.success).toBe(true);
      expect(loginResult.data.id).toBe(signupResult.data.id);
    });

    it('should allow getting user profile after signup', async () => {
      // Signup
      const signupDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const signupResult = await userService.signup(signupDto);

      // Get profile
      const user = await userService.getUserById(signupResult.data.id);

      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
    });

    it('should handle multiple users correctly', async () => {
      // Create multiple users
      await userService.signup({ email: 'user1@example.com', password: 'pass1' });
      await userService.signup({ email: 'user2@example.com', password: 'pass2' });
      await userService.signup({ email: 'user3@example.com', password: 'pass3' });

      // Login as different users
      const login1 = await userService.login({
        email: 'user1@example.com',
        password: 'pass1',
      });
      const login2 = await userService.login({
        email: 'user2@example.com',
        password: 'pass2',
      });

      expect(login1.data.id).not.toBe(login2.data.id);
      expect(login1.data.email).toBe('user1@example.com');
      expect(login2.data.email).toBe('user2@example.com');
    });
  });
});
