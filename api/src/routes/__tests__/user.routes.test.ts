import request from 'supertest';
import { createTestApp } from '../../__tests__/helpers/testApp';
import { createTestUser, cleanDatabase } from '../../__tests__/helpers/testDb';
import { generateTestToken } from '../../__tests__/helpers/authHelpers';

describe('User Routes Integration Tests', () => {
  const app = createTestApp();

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('POST /api/users/signup', () => {
    it('should create a new user and return token', async () => {
      const response = await request(app)
        .post('/api/users/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data.token).toBeDefined();
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/users/signup')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should return 400 for short password', async () => {
      const response = await request(app)
        .post('/api/users/signup')
        .send({
          email: 'test@example.com',
          password: '12345',
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details.some((e: any) => e.path === 'password')).toBe(true);
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/users/signup')
        .send({
          password: 'password123',
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/users/signup')
        .send({
          email: 'test@example.com',
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 409 for duplicate email', async () => {
      await createTestUser({ email: 'test@example.com' });

      const response = await request(app)
        .post('/api/users/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(409);

      expect(response.body.error).toBe('A user with this email already exists');
    });

    it('should normalize email to lowercase', async () => {
      const response = await request(app)
        .post('/api/users/signup')
        .send({
          email: 'TEST@EXAMPLE.COM',
          password: 'password123',
        })
        .expect(201);

      expect(response.body.data.email).toBe('test@example.com');
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      // Create a user via signup to ensure password is properly hashed
      await request(app).post('/api/users/signup').send({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Authentication successful');
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data.token).toBeDefined();
    });

    it('should return 401 for incorrect password', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid email or password');
    });

    it('should return 401 for non-existent email', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid email or password');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should handle email case-insensitively', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'TEST@EXAMPLE.COM',
          password: 'password123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/users/profile', () => {
    let userId: string;
    let token: string;

    beforeEach(async () => {
      const signupResponse = await request(app).post('/api/users/signup').send({
        email: 'test@example.com',
        password: 'password123',
      });

      userId = signupResponse.body.data.id;
      token = signupResponse.body.data.token;
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data.created_at).toBeDefined();
    });

    it('should not include password in response', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should return 401 without authorization header', async () => {
      const response = await request(app).get('/api/users/profile').expect(401);

      expect(response.body.error).toBe('Authentication required');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error).toBe('Invalid token');
    });

    it('should return 401 with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body.error).toBe('Authentication required');
    });

    it('should return 401 with expired token', async () => {
      // Create a user
      const user = await createTestUser({ email: 'expired@example.com' });

      // Generate expired token
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'test-jwt-secret',
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.error).toBe('Invalid token');
    });
  });

  describe('Authentication flow', () => {
    it('should complete full signup-login-profile flow', async () => {
      // Signup
      const signupResponse = await request(app)
        .post('/api/users/signup')
        .send({
          email: 'flow@example.com',
          password: 'password123',
        })
        .expect(201);

      expect(signupResponse.body.success).toBe(true);
      const signupToken = signupResponse.body.data.token;

      // Login
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: 'flow@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      const loginToken = loginResponse.body.data.token;

      // Get profile with signup token
      const profileResponse1 = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${signupToken}`)
        .expect(200);

      expect(profileResponse1.body.data.email).toBe('flow@example.com');

      // Get profile with login token
      const profileResponse2 = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${loginToken}`)
        .expect(200);

      expect(profileResponse2.body.data.email).toBe('flow@example.com');
    });
  });
});
