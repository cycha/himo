import { prisma } from '../lib/prisma';
import { User, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 12;

export type UserWithoutPassword = Omit<User, 'password'>;

export class UserRepositoryPrisma {
  /**
   * Find user by ID (without password)
   */
  async findById(id: string): Promise<UserWithoutPassword | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });
    return user;
  }

  /**
   * Find user by ID with password (for authentication)
   */
  async findByIdWithPassword(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Find user by email (with password for auth)
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  /**
   * Create a new user (with password hashing)
   */
  async create(userData: { email: string; password: string }): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, BCRYPT_ROUNDS);
    
    return prisma.user.create({
      data: {
        email: userData.email.toLowerCase(),
        password: hashedPassword,
      },
    });
  }

  /**
   * Update user
   */
  async update(id: string, userData: Partial<Pick<User, 'email' | 'password'>>): Promise<UserWithoutPassword | null> {
    try {
      const updateData: Prisma.UserUpdateInput = {};
      
      if (userData.email) {
        updateData.email = userData.email.toLowerCase();
      }
      
      if (userData.password) {
        updateData.password = await bcrypt.hash(userData.password, BCRYPT_ROUNDS);
      }

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });
      
      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null; // Not found
      }
      throw error;
    }
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false; // Not found
      }
      throw error;
    }
  }

  /**
   * Check if user exists
   */
  async exists(email: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { email: email.toLowerCase() },
    });
    return count > 0;
  }

  /**
   * Get total user count
   */
  async count(): Promise<number> {
    return prisma.user.count();
  }

  /**
   * Verify password
   */
  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
}

export const userRepository = new UserRepositoryPrisma();
