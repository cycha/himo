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
 * @route   POST /api/bot/cron/start
 * @desc    Start the bot cron scheduler
 * @access  Private (authenticated users only)
 */
router.post('/cron/start', botController.startCron.bind(botController));

/**
 * @route   POST /api/bot/cron/stop
 * @desc    Stop the bot cron scheduler
 * @access  Private (authenticated users only)
 */
router.post('/cron/stop', botController.stopCron.bind(botController));

/**
 * @route   POST /api/bot/trigger
 * @desc    Trigger a manual scraping task
 * @access  Private (authenticated users only)
 */
router.post('/trigger', botController.trigger.bind(botController));

/**
 * @route   POST /api/bot/stop
 * @desc    Stop the bot
 * @access  Private (authenticated users only)
 */
router.post('/stop', botController.stop.bind(botController));

export default router;
