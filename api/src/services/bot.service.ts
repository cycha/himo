import { botRepository } from '../repositories/bot.repository';
import { prisma } from '../lib/prisma';
import { BotRun } from '@prisma/client';
import axios from 'axios';

export interface BotStatusDto {
  isRunning: boolean;
  currentRun?: BotRun;
  lastRun?: BotRun;
}

export interface BotStatsDto {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  totalAdsSaved: number;
  averageAdsSavedPerRun: number;
  lastRunTime: Date | null;
  totalAdsInDatabase: number;
  recentRuns: BotRun[];
}

export interface IBotService {
  getStatus(): Promise<BotStatusDto>;
  getStats(): Promise<BotStatsDto>;
  startBot(triggeredBy?: string): Promise<BotRun>;
  stopBot(): Promise<boolean>;
}

export class BotServicePrisma implements IBotService {
  private readonly botUrl: string;

  constructor(private readonly repository = botRepository) {
    this.botUrl = process.env.BOT_URL || 'http://localhost:3002';
  }

  /**
   * Get current bot status
   */
  async getStatus(): Promise<BotStatusDto> {
    const runningRuns = await this.repository.findRunning();
    const currentRun = runningRuns[0] || undefined;
    const lastRun = await this.repository.findMostRecent();

    return {
      isRunning: runningRuns.length > 0,
      currentRun,
      lastRun: currentRun ? undefined : lastRun || undefined,
    };
  }

  /**
   * Get bot statistics
   */
  async getStats(): Promise<BotStatsDto> {
    const [stats, recentRuns, totalAds] = await Promise.all([
      this.repository.getStats(),
      this.repository.findRecent(10),
      prisma.ad.count(),
    ]);

    return {
      ...stats,
      totalAdsInDatabase: totalAds,
      recentRuns,
    };
  }

  /**
   * Start the bot (manual trigger)
   */
  async startBot(triggeredBy: string = 'manual'): Promise<BotRun> {
    // Check if bot is already running
    const runningRuns = await this.repository.findRunning();
    if (runningRuns.length > 0) {
      throw new Error('Bot is already running');
    }

    // Create a new bot run record
    const botRun = await this.repository.createRun({ triggeredBy });

    // Trigger scraping via HTTP call to bot service
    try {
      await axios.post(
        `${this.botUrl}/trigger-scrape`,
        {
          runId: botRun.id,
        },
        {
          timeout: 5000, // 5 second timeout for the HTTP call itself
        }
      );
    } catch (error) {
      // If bot service is not reachable, update run as failed
      await this.repository.updateRun(botRun.id, {
        status: 'failed',
        endTime: new Date(),
        errorMessage: `Failed to connect to bot service: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      throw new Error('Bot service is not available');
    }

    return botRun;
  }

  /**
   * Stop the bot
   */
  async stopBot(): Promise<boolean> {
    // Find the currently running bot run
    const runningRuns = await this.repository.findRunning();
    if (runningRuns.length === 0) {
      return false;
    }

    const currentRun = runningRuns[0];

    // Update the bot run status to stopped
    await this.repository.updateRun(currentRun.id, {
      status: 'stopped',
      endTime: new Date(),
    });

    // Note: We can't actually stop the scraping task once it's started
    // This just marks it as stopped in the database
    // For production, you'd implement a proper cancellation mechanism
    return true;
  }
}

export const botService = new BotServicePrisma();
