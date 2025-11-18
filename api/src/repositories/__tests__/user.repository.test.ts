import { userRepository, UserRepositoryPrisma } from '../user.repository';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcrypt';
import { createTestUser, cleanDatabase } from '../../__tests__/helpers/testDb';

describe('UserRepository', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await userRepository.create(userData);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.password).not.toBe('password123'); // Should be hashed
      expect(user.createdAt).toBeInstanceOf(Date);

      // Verify password was hashed correctly
      const isPasswordValid = await bcrypt.compare('password123', user.password);
      expect(isPasswordValid).toBe(true);
    });

    it('should convert email to lowercase', async () => {
      const userData = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      };

      const user = await userRepository.create(userData);

      expect(user.email).toBe('test@example.com');
    });

    it('should throw error when creating duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      };

      await userRepository.create(userData);

      // Try to create duplicate
      await expect(userRepository.create(userData)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should find user by ID without password', async () => {
      const createdUser = await createTestUser({ email: 'test@example.com' });

      const user = await userRepository.findById(createdUser.id);

      expect(user).toBeDefined();
      expect(user?.id).toBe(createdUser.id);
      expect(user?.email).toBe('test@example.com');
      expect(user).not.toHaveProperty('password');
    });

    it('should return null for non-existent user', async () => {
      const user = await userRepository.findById('non-existent-id');

      expect(user).toBeNull();
    });
  });

  describe('findByIdWithPassword', () => {
    it('should find user by ID with password', async () => {
      const createdUser = await createTestUser({ email: 'test@example.com' });

      const user = await userRepository.findByIdWithPassword(createdUser.id);

      expect(user).toBeDefined();
      expect(user?.id).toBe(createdUser.id);
      expect(user?.email).toBe('test@example.com');
      expect(user?.password).toBeDefined();
    });

    it('should return null for non-existent user', async () => {
      const user = await userRepository.findByIdWithPassword('non-existent-id');

      expect(user).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      await createTestUser({ email: 'test@example.com' });

      const user = await userRepository.findByEmail('test@example.com');

      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
      expect(user?.password).toBeDefined();
    });

    it('should find user by email case-insensitively', async () => {
      await createTestUser({ email: 'test@example.com' });

      const user = await userRepository.findByEmail('TEST@EXAMPLE.COM');

      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
    });

    it('should return null for non-existent email', async () => {
      const user = await userRepository.findByEmail('nonexistent@example.com');

      expect(user).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user email', async () => {
      const createdUser = await createTestUser({ email: 'test@example.com' });

      const updatedUser = await userRepository.update(createdUser.id, {
        email: 'updated@example.com',
      });

      expect(updatedUser).toBeDefined();
      expect(updatedUser?.email).toBe('updated@example.com');
      expect(updatedUser).not.toHaveProperty('password');
    });

    it('should update user password', async () => {
      const createdUser = await createTestUser({ email: 'test@example.com' });
      const oldPassword = createdUser.password;

      const updatedUser = await userRepository.update(createdUser.id, {
        password: 'newpassword123',
      });

      expect(updatedUser).toBeDefined();

      // Verify password was changed and hashed
      const userWithPassword = await userRepository.findByIdWithPassword(createdUser.id);
      expect(userWithPassword?.password).not.toBe(oldPassword);

      const isPasswordValid = await bcrypt.compare('newpassword123', userWithPassword!.password);
      expect(isPasswordValid).toBe(true);
    });

    it('should update both email and password', async () => {
      const createdUser = await createTestUser({ email: 'test@example.com' });

      const updatedUser = await userRepository.update(createdUser.id, {
        email: 'updated@example.com',
        password: 'newpassword123',
      });

      expect(updatedUser).toBeDefined();
      expect(updatedUser?.email).toBe('updated@example.com');

      // Verify password was changed
      const userWithPassword = await userRepository.findByIdWithPassword(createdUser.id);
      const isPasswordValid = await bcrypt.compare('newpassword123', userWithPassword!.password);
      expect(isPasswordValid).toBe(true);
    });

    it('should convert email to lowercase when updating', async () => {
      const createdUser = await createTestUser({ email: 'test@example.com' });

      const updatedUser = await userRepository.update(createdUser.id, {
        email: 'UPDATED@EXAMPLE.COM',
      });

      expect(updatedUser?.email).toBe('updated@example.com');
    });

    it('should return null for non-existent user', async () => {
      const updatedUser = await userRepository.update('non-existent-id', {
        email: 'updated@example.com',
      });

      expect(updatedUser).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      const createdUser = await createTestUser({ email: 'test@example.com' });

      const result = await userRepository.delete(createdUser.id);

      expect(result).toBe(true);

      // Verify user was deleted
      const user = await userRepository.findById(createdUser.id);
      expect(user).toBeNull();
    });

    it('should return false for non-existent user', async () => {
      const result = await userRepository.delete('non-existent-id');

      expect(result).toBe(false);
    });
  });

  describe('exists', () => {
    it('should return true for existing email', async () => {
      await createTestUser({ email: 'test@example.com' });

      const exists = await userRepository.exists('test@example.com');

      expect(exists).toBe(true);
    });

    it('should return true for existing email (case-insensitive)', async () => {
      await createTestUser({ email: 'test@example.com' });

      const exists = await userRepository.exists('TEST@EXAMPLE.COM');

      expect(exists).toBe(true);
    });

    it('should return false for non-existent email', async () => {
      const exists = await userRepository.exists('nonexistent@example.com');

      expect(exists).toBe(false);
    });
  });

  describe('count', () => {
    it('should return 0 when no users exist', async () => {
      const count = await userRepository.count();

      expect(count).toBe(0);
    });

    it('should return correct count of users', async () => {
      await createTestUser({ email: 'user1@example.com' });
      await createTestUser({ email: 'user2@example.com' });
      await createTestUser({ email: 'user3@example.com' });

      const count = await userRepository.count();

      expect(count).toBe(3);
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const user = await userRepository.create({
        email: 'test@example.com',
        password: 'password123',
      });

      const isValid = await userRepository.verifyPassword(user, 'password123');

      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const user = await userRepository.create({
        email: 'test@example.com',
        password: 'password123',
      });

      const isValid = await userRepository.verifyPassword(user, 'wrongpassword');

      expect(isValid).toBe(false);
    });

    it('should return false for empty password', async () => {
      const user = await userRepository.create({
        email: 'test@example.com',
        password: 'password123',
      });

      const isValid = await userRepository.verifyPassword(user, '');

      expect(isValid).toBe(false);
    });
  });
});
