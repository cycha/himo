import express, { Request, Response } from 'express';
import { scrapingTask } from './tasks/scraping-task';
import { Logger } from './utils/logger';

const logger = new Logger('BotServer');
const app = express();
const port = process.env.BOT_PORT || 3002;

app.use(express.json());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'himo-bot', version: '2.0.0' });
});

// Trigger scraping endpoint
app.post('/trigger-scrape', async (req: Request, res: Response) => {
  const { runId } = req.body;

  if (!runId) {
    return res.status(400).json({ error: 'runId is required' });
  }

  logger.info(`Received scraping request for runId: ${runId}`);

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

export function startServer(): void {
  app.listen(port, () => {
    logger.info(`Bot HTTP server listening on port ${port}`);
  });
}
