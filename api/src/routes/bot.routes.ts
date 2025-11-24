import { Router, type Router as RouterType } from 'express';
import { botController } from '../controllers/bot.controller';
import { authenticate } from '../middleware/auth';

const router: RouterType = Router();

// All bot routes require authentication
router.use(authenticate);

router.get('/status', botController.getStatus.bind(botController));
router.get('/stats', botController.getStats.bind(botController));
router.post('/cron/start', botController.startCron.bind(botController));
router.post('/cron/stop', botController.stopCron.bind(botController));
router.post('/trigger', botController.trigger.bind(botController));
router.post('/stop', botController.stop.bind(botController));

export default router;
