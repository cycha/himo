import { Request, Response } from 'express';
import { validationResult, FieldValidationError } from 'express-validator';
import { signupValidation, loginValidation, searchValidation } from '../validation';

describe('Validation Middleware', () => {
  // Helper function to run validation chains
  const runValidation = async (validationChains: any[], body: any) => {
    const req = { body } as Request;
    const res = {} as Response;

    for (const validation of validationChains) {
      await validation.run(req);
    }

    return validationResult(req);
  };

  // Helper function to check if error is a field validation error
  const isFieldError = (error: any): error is FieldValidationError => {
    return error.type === 'field' && 'path' in error;
  };

  describe('Signup Validation', () => {
    it('should pass with valid email and password', async () => {
      const body = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await runValidation(signupValidation, body);

      expect(result.isEmpty()).toBe(true);
    });

    it('should fail with invalid email format', async () => {
      const body = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = await runValidation(signupValidation, body);

      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => isFieldError(e) && e.path === 'email')).toBe(true);
      expect(errors.find(e => isFieldError(e) && e.path === 'email')?.msg).toBe('Please provide a valid email address');
    });

    it('should fail with missing email', async () => {
      const body = {
        password: 'password123',
      };

      const result = await runValidation(signupValidation, body);

      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => isFieldError(e) && e.path === 'email')).toBe(true);
    });

    it('should fail with password less than 6 characters', async () => {
      const body = {
        email: 'test@example.com',
        password: '12345',
      };

      const result = await runValidation(signupValidation, body);

      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => isFieldError(e) && e.path === 'password')).toBe(true);
      expect(errors.find(e => isFieldError(e) && e.path === 'password')?.msg).toBe('Password must be at least 6 characters long');
    });

    it('should fail with missing password', async () => {
      const body = {
        email: 'test@example.com',
      };

      const result = await runValidation(signupValidation, body);

      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => isFieldError(e) && e.path === 'password')).toBe(true);
    });

    it('should normalize email to lowercase', async () => {
      const body = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      };

      const req = { body } as Request;
      const res = {} as Response;

      for (const validation of signupValidation) {
        await validation.run(req);
      }

      expect(req.body.email).toBe('test@example.com');
    });

    it('should accept exactly 6 character password', async () => {
      const body = {
        email: 'test@example.com',
        password: '123456',
      };

      const result = await runValidation(signupValidation, body);

      expect(result.isEmpty()).toBe(true);
    });
  });

  describe('Login Validation', () => {
    it('should pass with valid email and password', async () => {
      const body = {
        email: 'test@example.com',
        password: 'anypassword',
      };

      const result = await runValidation(loginValidation, body);

      expect(result.isEmpty()).toBe(true);
    });

    it('should fail with invalid email format', async () => {
      const body = {
        email: 'invalid-email',
        password: 'password',
      };

      const result = await runValidation(loginValidation, body);

      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => isFieldError(e) && e.path === 'email')).toBe(true);
    });

    it('should fail with missing email', async () => {
      const body = {
        password: 'password',
      };

      const result = await runValidation(loginValidation, body);

      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => isFieldError(e) && e.path === 'email')).toBe(true);
    });

    it('should fail with empty password', async () => {
      const body = {
        email: 'test@example.com',
        password: '',
      };

      const result = await runValidation(loginValidation, body);

      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => isFieldError(e) && e.path === 'password')).toBe(true);
      expect(errors.find(e => isFieldError(e) && e.path === 'password')?.msg).toBe('Password is required');
    });

    it('should fail with missing password', async () => {
      const body = {
        email: 'test@example.com',
      };

      const result = await runValidation(loginValidation, body);

      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => isFieldError(e) && e.path === 'password')).toBe(true);
    });

    it('should normalize email to lowercase', async () => {
      const body = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password',
      };

      const req = { body } as Request;
      const res = {} as Response;

      for (const validation of loginValidation) {
        await validation.run(req);
      }

      expect(req.body.email).toBe('test@example.com');
    });

    it('should accept any non-empty password', async () => {
      const body = {
        email: 'test@example.com',
        password: '1',
      };

      const result = await runValidation(loginValidation, body);

      expect(result.isEmpty()).toBe(true);
    });
  });

  describe('Search Validation', () => {
    it('should pass with no filters', async () => {
      const body = {};

      const result = await runValidation(searchValidation, body);

      expect(result.isEmpty()).toBe(true);
    });

    it('should pass with valid price range', async () => {
      const body = {
        priceMin: 100000,
        priceMax: 500000,
      };

      const result = await runValidation(searchValidation, body);

      expect(result.isEmpty()).toBe(true);
    });

    it('should pass with valid surface range', async () => {
      const body = {
        surfaceMin: 50,
        surfaceMax: 200,
      };

      const result = await runValidation(searchValidation, body);

      expect(result.isEmpty()).toBe(true);
    });

    it('should pass with valid page number', async () => {
      const body = {
        page: 2,
      };

      const result = await runValidation(searchValidation, body);

      expect(result.isEmpty()).toBe(true);
    });

    it('should fail with negative priceMin', async () => {
      const body = {
        priceMin: -100,
      };

      const result = await runValidation(searchValidation, body);

      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => isFieldError(e) && e.path === 'priceMin')).toBe(true);
      expect(errors.find(e => isFieldError(e) && e.path === 'priceMin')?.msg).toBe('Minimum price must be positive');
    });

    it('should fail with negative priceMax', async () => {
      const body = {
        priceMax: -100,
      };

      const result = await runValidation(searchValidation, body);

      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => isFieldError(e) && e.path === 'priceMax')).toBe(true);
    });

    it('should fail with non-numeric priceMin', async () => {
      const body = {
        priceMin: 'invalid',
      };

      const result = await runValidation(searchValidation, body);

      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => isFieldError(e) && e.path === 'priceMin')).toBe(true);
      expect(errors.find(e => isFieldError(e) && e.path === 'priceMin')?.msg).toBe('Minimum price must be a number');
    });

    it('should fail with non-numeric priceMax', async () => {
      const body = {
        priceMax: 'invalid',
      };

      const result = await runValidation(searchValidation, body);

      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => isFieldError(e) && e.path === 'priceMax')).toBe(true);
    });

    it('should fail with negative surfaceMin', async () => {
      const body = {
        surfaceMin: -50,
      };

      const result = await runValidation(searchValidation, body);

      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => isFieldError(e) && e.path === 'surfaceMin')).toBe(true);
    });

    it('should fail with negative surfaceMax', async () => {
      const body = {
        surfaceMax: -100,
      };

      const result = await runValidation(searchValidation, body);

      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => isFieldError(e) && e.path === 'surfaceMax')).toBe(true);
    });

    it('should fail with non-numeric surfaceMin', async () => {
      const body = {
        surfaceMin: 'invalid',
      };

      const result = await runValidation(searchValidation, body);

      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => isFieldError(e) && e.path === 'surfaceMin')).toBe(true);
    });

    it('should fail with non-numeric surfaceMax', async () => {
      const body = {
        surfaceMax: 'invalid',
      };

      const result = await runValidation(searchValidation, body);

      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => isFieldError(e) && e.path === 'surfaceMax')).toBe(true);
    });

    it('should fail with negative page number', async () => {
      const body = {
        page: -1,
      };

      const result = await runValidation(searchValidation, body);

      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => isFieldError(e) && e.path === 'page')).toBe(true);
      expect(errors.find(e => isFieldError(e) && e.path === 'page')?.msg).toBe('Page must be a positive integer');
    });

    it('should fail with decimal page number', async () => {
      const body = {
        page: 1.5,
      };

      const result = await runValidation(searchValidation, body);

      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => isFieldError(e) && e.path === 'page')).toBe(true);
    });

    it('should accept zero as page number', async () => {
      const body = {
        page: 0,
      };

      const result = await runValidation(searchValidation, body);

      expect(result.isEmpty()).toBe(true);
    });

    it('should accept zero as priceMin', async () => {
      const body = {
        priceMin: 0,
      };

      const result = await runValidation(searchValidation, body);

      expect(result.isEmpty()).toBe(true);
    });

    it('should accept zero as surfaceMin', async () => {
      const body = {
        surfaceMin: 0,
      };

      const result = await runValidation(searchValidation, body);

      expect(result.isEmpty()).toBe(true);
    });

    it('should accept decimal values for prices', async () => {
      const body = {
        priceMin: 100000.50,
        priceMax: 500000.99,
      };

      const result = await runValidation(searchValidation, body);

      expect(result.isEmpty()).toBe(true);
    });

    it('should accept decimal values for surfaces', async () => {
      const body = {
        surfaceMin: 50.5,
        surfaceMax: 200.75,
      };

      const result = await runValidation(searchValidation, body);

      expect(result.isEmpty()).toBe(true);
    });

    it('should accumulate multiple validation errors', async () => {
      const body = {
        priceMin: -100,
        priceMax: 'invalid',
        surfaceMin: -50,
        page: -1,
      };

      const result = await runValidation(searchValidation, body);

      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.length).toBeGreaterThan(3);
    });
  });
});
