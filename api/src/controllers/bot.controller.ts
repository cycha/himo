import { Request, Response, NextFunction } from 'express';
import { botService } from '../services/bot.service';
import {
  BotStatusResponseDto,
  BotStatsResponseDto,
  BotStartResponseDto,
  BotStopResponseDto,
} from '../dtos/bot.dto';

export class BotController {
  constructor(private readonly service = botService) {}

  /**
   * GET /api/bot/status
   * Get current bot status
   */
  async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = await this.service.getStatus();

      const response: BotStatusResponseDto = {
        success: true,
        data: status,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/bot/stats
   * Get bot statistics
   */
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this.service.getStats();

      const response: BotStatsResponseDto = {
        success: true,
        data: stats,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/bot/cron/start
   * Start the bot cron scheduler
   */
  async startCron(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.service.startCron();

      const response: BotStopResponseDto = {
        success: true,
        message: 'Bot cron scheduler started successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/bot/cron/stop
   * Stop the bot cron scheduler
   */
  async stopCron(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.service.stopCron();

      const response: BotStopResponseDto = {
        success: true,
        message: 'Bot cron scheduler stopped successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/bot/trigger
   * Trigger a manual scraping task
   */
  async trigger(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const botRun = await this.service.triggerScrape('manual');

      const response: BotStartResponseDto = {
        success: true,
        data: botRun,
        message: 'Scraping task started successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      if (error instanceof Error && error.message === 'Bot is already running') {
        res.status(409).json({
          success: false,
          error: 'Bot is already running',
        });
        return;
      }
      next(error);
    }
  }

  /**
   * POST /api/bot/stop
   * Stop the bot
   */
  async stop(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stopped = await this.service.stopBot();

      if (!stopped) {
        res.status(400).json({
          success: false,
          error: 'Bot is not running',
        });
        return;
      }

      const response: BotStopResponseDto = {
        success: true,
        message: 'Bot stopped successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const botController = new BotController();
