import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

/**
 * Generates a valid JWT token for testing
 */
export function generateTestToken(userId: string, email: string): string {
  return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '24h' });
}

/**
 * Generates an expired JWT token for testing
 */
export function generateExpiredToken(userId: string, email: string): string {
  return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '-1h' });
}

/**
 * Generates an invalid JWT token for testing
 */
export function generateInvalidToken(): string {
  return jwt.sign({ id: 'test', email: 'test@example.com' }, 'wrong-secret');
}

/**
 * Decodes a JWT token without verification (for testing)
 */
export function decodeToken(token: string) {
  return jwt.decode(token);
}
