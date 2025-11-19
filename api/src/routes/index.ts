import { Router } from 'express';
import type { Router as RouterType } from 'express';
import adRoutes from './ad.routes';
import userRoutes from './user.routes';

const router: RouterType = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/ads', adRoutes);
router.use('/users', userRoutes);

// Legacy routes for backward compatibility
router.post('/search', adRoutes);
router.post('/user/signup', userRoutes);
router.post('/user/login', userRoutes);

export default router;
