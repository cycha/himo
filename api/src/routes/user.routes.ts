import { Router, type Router as RouterType } from 'express';
import { userController } from '../controllers/user.controller';
import { signupValidation, loginValidation } from '../middleware/validation';
import { handleValidationErrors } from '../middleware/error-handler';
import { authenticate } from '../middleware/auth';

const router: RouterType = Router();

// POST /api/users/signup - Register a new user
router.post(
  '/signup',
  signupValidation,
  handleValidationErrors,
  userController.signup.bind(userController)
);

// POST /api/users/login - Login user
router.post(
  '/login',
  loginValidation,
  handleValidationErrors,
  userController.login.bind(userController)
);

// GET /api/users/profile - Get user profile (private)
router.get('/profile', authenticate, userController.getProfile.bind(userController));

export default router;
