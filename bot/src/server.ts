import express, { Request, Response } from 'express';
import { scrapingTask } from './tasks/scraping-task';
import { Logger } from './utils/logger';
import type { ScheduledTask } from 'node-cron';

const logger = new Logger('BotServer');
const app = express();
const port = process.env.BOT_PORT || 3002;

// Store cron jobs so we can start/stop them
let scrapingJob: ScheduledTask | null = null;
let cleanupJob: ScheduledTask | null = null;
let isSchedulerRunning = false;

app.use(express.json());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'himo-bot', version: '2.0.0' });
});

// Get bot status (cron jobs running or not)
app.get('/status', (_req: Request, res: Response) => {
  res.json({
    scrapingJobActive: !!scrapingJob,
    scrapingJobRunning: isSchedulerRunning,
    cleanupJobActive: !!cleanupJob,
    cleanupJobRunning: isSchedulerRunning
  });
});

// Start cron jobs
app.post('/start', (_req: Request, res: Response) => {
  if (!scrapingJob || !cleanupJob) {
    return res.status(500).json({ error: 'Cron jobs not initialized' });
  }

  logger.info('Starting bot cron jobs...');

  scrapingJob.start();
  cleanupJob.start();
  isSchedulerRunning = true;

  res.json({ message: 'Bot cron jobs started' });
});

// Stop cron jobs
app.post('/stop', (_req: Request, res: Response) => {
  if (!scrapingJob || !cleanupJob) {
    return res.status(500).json({ error: 'Cron jobs not initialized' });
  }

  logger.info('Stopping bot cron jobs...');

  scrapingJob.stop();
  cleanupJob.stop();
  isSchedulerRunning = false;

  res.json({ message: 'Bot cron jobs stopped' });
});

// Trigger scraping manually
app.post('/trigger-scrape', async (req: Request, res: Response) => {
  const { runId } = req.body;

  if (!runId) {
    return res.status(400).json({ error: 'runId is required' });
  }

  logger.info(`Received manual scraping request for runId: ${runId}`);

  // Set the BOT_RUN_ID environment variable
  process.env.BOT_RUN_ID = runId;

  // Execute scraping task asynchronously (don't wait for completion)
  scrapingTask()
    .then(() => {
      logger.info(`Scraping task completed for runId: ${runId}`);
    })
    .catch((error) => {
      logger.error(`Scraping task failed for runId: ${runId}`, error);
    });

  // Respond immediately
  res.json({ message: 'Scraping task started', runId });
});

export function setJobs(scraping: ScheduledTask, cleanup: ScheduledTask): void {
  scrapingJob = scraping;
  cleanupJob = cleanup;
  // Jobs are started by default (scheduled: true in index.ts)
  isSchedulerRunning = true;
}

export function startServer(): void {
  app.listen(port, () => {
    logger.info(`Bot HTTP server listening on port ${port}`);
  });
}
