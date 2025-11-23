import { prisma } from '../lib/prisma';
import { Prisma, BotRun, BotRunStatus } from '@prisma/client';

export interface BotRunCreateData {
  triggeredBy?: string;
}

export interface BotRunUpdateData {
  status?: BotRunStatus;
  endTime?: Date;
  adsSaved?: number;
  pagesScraped?: number;
  failurePercentage?: number;
  averageRetriesPerRequest?: number;
  errorMessage?: string;
}

export class BotRepositoryPrisma {
  /**
   * Create a new bot run
   */
  async createRun(data: BotRunCreateData): Promise<BotRun> {
    return prisma.botRun.create({
      data: {
        triggeredBy: data.triggeredBy || 'manual',
        status: 'running',
      },
    });
  }

  /**
   * Update a bot run
   */
  async updateRun(id: string, data: BotRunUpdateData): Promise<BotRun | null> {
    try {
      return await prisma.botRun.update({
        where: { id },
        data,
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null; // Not found
      }
      throw error;
    }
  }

  /**
   * Find bot run by ID
   */
  async findById(id: string): Promise<BotRun | null> {
    return prisma.botRun.findUnique({
      where: { id },
    });
  }

  /**
   * Get the most recent bot run
   */
  async findMostRecent(): Promise<BotRun | null> {
    return prisma.botRun.findFirst({
      orderBy: { startTime: 'desc' },
    });
  }

  /**
   * Get recent bot runs (paginated)
   */
  async findRecent(limit: number = 10): Promise<BotRun[]> {
    return prisma.botRun.findMany({
      orderBy: { startTime: 'desc' },
      take: limit,
    });
  }

  /**
   * Find currently running bot runs
   */
  async findRunning(): Promise<BotRun[]> {
    return prisma.botRun.findMany({
      where: { status: 'running' },
      orderBy: { startTime: 'desc' },
    });
  }

  /**
   * Get bot statistics
   */
  async getStats(): Promise<{
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    totalAdsSaved: number;
    averageAdsSavedPerRun: number;
    lastRunTime: Date | null;
  }> {
    const [totalRuns, successfulRuns, failedRuns, aggregateData, mostRecent] = await Promise.all([
      prisma.botRun.count(),
      prisma.botRun.count({ where: { status: 'completed' } }),
      prisma.botRun.count({ where: { status: 'failed' } }),
      prisma.botRun.aggregate({
        _sum: {
          adsSaved: true,
        },
        _avg: {
          adsSaved: true,
        },
      }),
      this.findMostRecent(),
    ]);

    return {
      totalRuns,
      successfulRuns,
      failedRuns,
      totalAdsSaved: aggregateData._sum.adsSaved || 0,
      averageAdsSavedPerRun: aggregateData._avg.adsSaved || 0,
      lastRunTime: mostRecent?.startTime || null,
    };
  }

  /**
   * Count bot runs by status
   */
  async countByStatus(status: BotRunStatus): Promise<number> {
    return prisma.botRun.count({
      where: { status },
    });
  }

  /**
   * Delete old bot runs (cleanup)
   */
  async deleteOlderThan(date: Date): Promise<number> {
    const result = await prisma.botRun.deleteMany({
      where: {
        startTime: { lt: date },
      },
    });
    return result.count;
  }
}

export const botRepository = new BotRepositoryPrisma();
