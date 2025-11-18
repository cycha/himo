import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import router from '../../routes';
import { errorHandler } from '../../middleware/error-handler';

/**
 * Creates an Express app instance for testing without starting the server
 */
export function createTestApp(): Application {
  const app: Application = express();

  // Security middleware
  app.use(helmet());

  // CORS configuration
  app.use(cors({
    origin: '*',
    credentials: true,
    optionsSuccessStatus: 200,
  }));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API routes
  app.use('/api', router);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}
