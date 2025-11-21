import { Request, Response, NextFunction } from 'express';
import { Result, ValidationError, validationResult } from 'express-validator';
import { AppError, handleValidationErrors, errorHandler } from './error-handler';

// Mock express-validator
jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
  Result: jest.fn(),
  ValidationError: jest.fn(),
}));

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    mockRequest = {};
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
    nextFunction = jest.fn();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    jest.clearAllMocks();
  });

  describe('AppError Class', () => {
    it('should create an AppError with statusCode and message', () => {
      const error = new AppError(404, 'Not found');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Not found');
      expect(error.isOperational).toBe(true);
    });

    it('should allow setting isOperational to false', () => {
      const error = new AppError(500, 'Error', false);

      expect(error.isOperational).toBe(false);
    });

    it('should have correct prototype chain', () => {
      const error = new AppError(400, 'Bad request');

      expect(Object.getPrototypeOf(error)).toBe(AppError.prototype);
    });
  });

  describe('handleValidationErrors', () => {
    it('should call next() when no validation errors', () => {
      (validationResult as jest.Mock).mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      });

      handleValidationErrors(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should return 400 with validation errors', () => {
      const errors = [
        { path: 'email', msg: 'Invalid email', value: 'test' },
        { path: 'password', msg: 'Password too short', value: '123' },
      ];

      (validationResult as jest.Mock).mockReturnValue({
        isEmpty: () => false,
        array: () => errors,
      });

      handleValidationErrors(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: errors,
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle single validation error', () => {
      const errors = [{ path: 'email', msg: 'Invalid email' }];

      (validationResult as jest.Mock).mockReturnValue({
        isEmpty: () => false,
        array: () => errors,
      });

      handleValidationErrors(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: errors,
      });
    });
  });

  describe('errorHandler', () => {
    describe('AppError handling', () => {
      it('should handle AppError with correct status code', () => {
        const error = new AppError(404, 'Resource not found');

        errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Resource not found',
        });
      });

      it('should include stack trace in development mode', () => {
        process.env.NODE_ENV = 'development';
        const error = new AppError(400, 'Bad request');

        errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Bad request',
          stack: expect.any(String),
        });
      });

      it('should not include stack trace in production mode', () => {
        process.env.NODE_ENV = 'production';
        const error = new AppError(400, 'Bad request');

        errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Bad request',
        });
      });

      it('should handle 401 Unauthorized error', () => {
        const error = new AppError(401, 'Unauthorized');

        errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Unauthorized',
        });
      });

      it('should handle 409 Conflict error', () => {
        const error = new AppError(409, 'Email already exists');

        errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

        expect(statusMock).toHaveBeenCalledWith(409);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Email already exists',
        });
      });
    });

    describe('Prisma error handling', () => {
      it('should handle Prisma unique constraint error (P2002)', () => {
        const error: any = new Error('Unique constraint violation');
        error.name = 'PrismaClientKnownRequestError';
        error.code = 'P2002';

        errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

        expect(statusMock).toHaveBeenCalledWith(409);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Duplicate entry',
          message: 'A record with this value already exists',
        });
      });

      it('should handle Prisma validation error', () => {
        const error: any = new Error('Validation failed');
        error.name = 'PrismaClientValidationError';

        errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Validation error',
          message: 'Validation failed',
        });
      });

      it('should not handle Prisma errors with different error codes', () => {
        const error: any = new Error('Some Prisma error');
        error.name = 'PrismaClientKnownRequestError';
        error.code = 'P2025'; // Record not found

        errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

        // Should fall through to default error handler
        expect(statusMock).toHaveBeenCalledWith(500);
      });
    });

    describe('Generic error handling', () => {
      it('should handle generic Error with 500 status', () => {
        const error = new Error('Something went wrong');

        errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Internal server error',
          message: 'Something went wrong',
        });
      });

      it('should show detailed error message in development', () => {
        process.env.NODE_ENV = 'development';
        const error = new Error('Detailed error message');

        errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Internal server error',
          message: 'Detailed error message',
          stack: expect.any(String),
        });
      });

      it('should hide detailed error message in production', () => {
        process.env.NODE_ENV = 'production';
        const error = new Error('Detailed error message');

        errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
          error: 'Internal server error',
          message: 'Something went wrong',
        });
      });

      it('should log unhandled errors to console', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const error = new Error('Unhandled error');

        errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

        expect(consoleSpy).toHaveBeenCalledWith('Unhandled error:', error);
        consoleSpy.mockRestore();
      });
    });
  });
});
