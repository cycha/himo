import { Router, type Router as RouterType } from 'express';
import { botController } from '../controllers/bot.controller';
import { authenticate } from '../middleware/auth';

const router: RouterType = Router();

/**
 * All bot routes require authentication
 */
router.use(authenticate);

/**
 * @route   GET /api/bot/status
 * @desc    Get current bot status
 * @access  Private (authenticated users only)
 */
router.get('/status', botController.getStatus.bind(botController));

/**
 * @route   GET /api/bot/stats
 * @desc    Get bot statistics
 * @access  Private (authenticated users only)
 */
router.get('/stats', botController.getStats.bind(botController));

/**
 * @route   POST /api/bot/start
 * @desc    Start the bot (manual trigger)
 * @access  Private (authenticated users only)
 */
router.post('/start', botController.start.bind(botController));

/**
 * @route   POST /api/bot/stop
 * @desc    Stop the bot
 * @access  Private (authenticated users only)
 */
router.post('/stop', botController.stop.bind(botController));

export default router;
