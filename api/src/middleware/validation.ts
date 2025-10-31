import { body, ValidationChain } from 'express-validator';

export const signupValidation: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

export const loginValidation: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const searchValidation: ValidationChain[] = [
  body('priceMin')
    .optional()
    .isNumeric()
    .withMessage('Minimum price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be positive'),
  body('priceMax')
    .optional()
    .isNumeric()
    .withMessage('Maximum price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be positive'),
  body('surfaceMin')
    .optional()
    .isNumeric()
    .withMessage('Minimum surface must be a number')
    .isFloat({ min: 0 })
    .withMessage('Minimum surface must be positive'),
  body('surfaceMax')
    .optional()
    .isNumeric()
    .withMessage('Maximum surface must be a number')
    .isFloat({ min: 0 })
    .withMessage('Maximum surface must be positive'),
  body('page')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Page must be a positive integer'),
];
