import { BotRun } from '@prisma/client';

export interface BotStatusResponseDto {
  success: boolean;
  data: {
    isRunning: boolean;
    currentRun?: BotRun;
    lastRun?: BotRun;
  };
}

export interface BotStatsResponseDto {
  success: boolean;
  data: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    totalAdsSaved: number;
    averageAdsSavedPerRun: number;
    lastRunTime: Date | null;
    totalAdsInDatabase: number;
    recentRuns: BotRun[];
  };
}

export interface BotStartResponseDto {
  success: boolean;
  data: BotRun;
  message: string;
}

export interface BotStopResponseDto {
  success: boolean;
  message: string;
}

export interface BotErrorResponseDto {
  success: false;
  error: string;
}
