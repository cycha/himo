import { Request, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../auth';
import {
  generateTestToken,
  generateExpiredToken,
  generateInvalidToken,
} from '../../__tests__/helpers/authHelpers';

describe('Authentication Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    nextFunction = jest.fn();
  });

  describe('Valid authentication', () => {
    it('should authenticate with valid Bearer token', () => {
      const token = generateTestToken('user-123', 'test@example.com');
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.id).toBe('user-123');
      expect(mockRequest.user?.email).toBe('test@example.com');
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should attach user data to request object', () => {
      const token = generateTestToken('user-456', 'another@example.com');
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockRequest.user).toEqual({
        id: 'user-456',
        email: 'another@example.com',
        iat: expect.any(Number),
        exp: expect.any(Number),
      });
    });
  });

  describe('Missing or invalid authorization header', () => {
    it('should return 401 when authorization header is missing', () => {
      mockRequest.headers = {};

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Authentication required',
        message: 'Please provide a valid Bearer token',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header is empty', () => {
      mockRequest.headers = {
        authorization: '',
      };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Authentication required',
        message: 'Please provide a valid Bearer token',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header does not start with Bearer', () => {
      mockRequest.headers = {
        authorization: 'Basic abc123',
      };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Authentication required',
        message: 'Please provide a valid Bearer token',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 when only "Bearer" is provided without token', () => {
      mockRequest.headers = {
        authorization: 'Bearer ',
      };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Invalid token',
        message: 'The provided token is invalid or expired',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('Invalid tokens', () => {
    it('should return 401 for expired token', () => {
      const token = generateExpiredToken('user-123', 'test@example.com');
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Invalid token',
        message: 'The provided token is invalid or expired',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 for token with wrong secret', () => {
      const token = generateInvalidToken();
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Invalid token',
        message: 'The provided token is invalid or expired',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 for malformed token', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid.token.here',
      };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Invalid token',
        message: 'The provided token is invalid or expired',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 for completely invalid token string', () => {
      mockRequest.headers = {
        authorization: 'Bearer notajwttoken',
      };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Invalid token',
        message: 'The provided token is invalid or expired',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle authorization header with extra spaces', () => {
      const token = generateTestToken('user-123', 'test@example.com');
      mockRequest.headers = {
        authorization: `Bearer  ${token}`, // Extra space
      };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      // Should fail because of the extra space
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle lowercase bearer keyword', () => {
      const token = generateTestToken('user-123', 'test@example.com');
      mockRequest.headers = {
        authorization: `bearer ${token}`,
      };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      // Should fail because it's case-sensitive
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should not modify request object on authentication failure', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid',
      };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockRequest.user).toBeUndefined();
    });
  });
});
