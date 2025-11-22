import { botRepository } from '../repositories/bot.repository';
import { prisma } from '../lib/prisma';
import { BotRun, BotRunStatus } from '@prisma/client';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

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
  private currentProcess: ChildProcess | null = null;
  private currentRunId: string | null = null;

  constructor(private readonly repository = botRepository) {}

  /**
   * Get current bot status
   */
  async getStatus(): Promise<BotStatusDto> {
    const runningRuns = await this.repository.findRunning();
    const currentRun = runningRuns[0] || undefined;
    const lastRun = await this.repository.findMostRecent();

    return {
      isRunning: runningRuns.length > 0 || this.currentProcess !== null,
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
    this.currentRunId = botRun.id;

    // Start the bot process
    this.executeBotProcess(botRun.id);

    return botRun;
  }

  /**
   * Stop the bot
   */
  async stopBot(): Promise<boolean> {
    if (!this.currentProcess || !this.currentRunId) {
      return false;
    }

    // Kill the process
    this.currentProcess.kill('SIGTERM');
    this.currentProcess = null;

    // Update the bot run status
    await this.repository.updateRun(this.currentRunId, {
      status: 'stopped',
      endTime: new Date(),
    });

    this.currentRunId = null;
    return true;
  }

  /**
   * Execute the bot process
   */
  private executeBotProcess(runId: string): void {
    // Path to the bot executable
    const botPath = path.join(__dirname, '../../../bot/dist/index.js');

    // Spawn the bot process
    this.currentProcess = spawn('node', [botPath], {
      env: {
        ...process.env,
        BOT_RUN_ID: runId,
        NODE_ENV: process.env.NODE_ENV || 'development',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let errorLog = '';

    // Capture stdout
    this.currentProcess.stdout?.on('data', (data) => {
      console.log(`[Bot ${runId}]: ${data.toString()}`);
    });

    // Capture stderr
    this.currentProcess.stderr?.on('data', (data) => {
      errorLog += data.toString();
      console.error(`[Bot ${runId}] Error: ${data.toString()}`);
    });

    // Handle process exit
    this.currentProcess.on('exit', async (code, signal) => {
      console.log(`Bot process exited with code ${code} and signal ${signal}`);

      let status: BotRunStatus = 'completed';
      if (code !== 0 && signal !== 'SIGTERM') {
        status = 'failed';
      } else if (signal === 'SIGTERM') {
        status = 'stopped';
      }

      // Update the bot run with final status
      await this.repository.updateRun(runId, {
        status,
        endTime: new Date(),
        errorMessage: errorLog || undefined,
      });

      this.currentProcess = null;
      this.currentRunId = null;
    });

    // Handle process errors
    this.currentProcess.on('error', async (error) => {
      console.error(`Failed to start bot process: ${error.message}`);

      await this.repository.updateRun(runId, {
        status: 'failed',
        endTime: new Date(),
        errorMessage: error.message,
      });

      this.currentProcess = null;
      this.currentRunId = null;
    });
  }
}

export const botService = new BotServicePrisma();
