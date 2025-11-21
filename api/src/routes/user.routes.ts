import { Router, type Router as RouterType } from 'express';
import { userController } from '../controllers/user.controller';
import { signupValidation, loginValidation } from '../middleware/validation';
import { handleValidationErrors } from '../middleware/error-handler';
import { authenticate } from '../middleware/auth';

const router: RouterType = Router();

/**
 * @route   POST /api/users/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/signup',
  signupValidation,
  handleValidationErrors,
  userController.signup.bind(userController)
);

/**
 * @route   POST /api/users/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  loginValidation,
  handleValidationErrors,
  userController.login.bind(userController)
);

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', authenticate, userController.getProfile.bind(userController));

export default router;
