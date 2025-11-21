import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connect, disconnect } from './lib/prisma';
import router from './routes';
import { errorHandler } from './middleware/error-handler';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy (for rate limiting behind reverse proxies)
app.set('trust proxy', 1);

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, res: Response, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (Object.keys(req.body).length > 0) {
      console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    next();
  });
}

// API routes
app.use('/api', router);

// Legacy routes (backward compatibility)
app.post('/search', router);
app.post('/user/signup', router);
app.post('/user/login', router);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Himo API',
    version: '2.0.0',
    description: 'Real estate aggregator API',
    endpoints: {
      health: '/api/health',
      ads: '/api/ads',
      users: '/api/users',
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Server initialization
const PORT = process.env.API_PORT || 3000;

const startServer = async () => {
  try {
    // Connect to PostgreSQL
    await connect();

    // Start listening
    app.listen(PORT, () => {
      console.log('========================================');
      console.log(`🚀 Himo API Server v3.0.0`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`💾 Database: PostgreSQL + PostGIS`);
      console.log(`📡 Listening on port ${PORT}`);
      console.log(`🔗 http://localhost:${PORT}`);
      console.log('========================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Closing server gracefully...`);

  try {
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
startServer();

export default app;
