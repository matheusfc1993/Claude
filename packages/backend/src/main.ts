import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRouter from './routes/auth.js';
import financialRouter from './routes/financial.js';
import metricsRouter from './routes/metrics.js';
import aiAssistantRouter from './routes/ai-assistant.js';
import reportsRouter from './routes/reports.js';
import googleSheetsRouter from './routes/google-sheets.js';
import politicalGameRouter from './routes/political-game.js';
import { errorHandler } from './middlewares/error.js';
import { requestLogger } from './middlewares/logger.js';
import { initializeAllScheduledJobs } from './jobs/daily-report.job.js';

config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(requestLogger);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/financial', financialRouter);
app.use('/api/metrics', metricsRouter);
app.use('/api/ai', aiAssistantRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/google-sheets', googleSheetsRouter);
app.use('/api/games/political', politicalGameRouter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Initialize scheduled jobs
initializeAllScheduledJobs();

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n✓ Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});
