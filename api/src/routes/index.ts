import { Router, type Router as RouterType } from 'express';
import adRoutes from './ad.routes';
import userRoutes from './user.routes';
import botRoutes from './bot.routes';
import docsRoutes from './docs.routes';

const router: RouterType = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/ads', adRoutes);
router.use('/users', userRoutes);
router.use('/bot', botRoutes);
router.use('/docs', docsRoutes);

// Legacy routes for backward compatibility
router.post('/search', adRoutes);
router.post('/user/signup', userRoutes);
router.post('/user/login', userRoutes);

export default router;
