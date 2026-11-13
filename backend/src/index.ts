import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import 'dotenv/config';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { logger } from './config/logger';
import { correlationMiddleware } from './middleware/correlation.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { authRoutes } from './modules/auth/auth.routes';
import { usersRoutes } from './modules/users/users.routes';
import { walletsRoutes } from './modules/wallets/wallets.routes';
import { recipientsRoutes } from './modules/recipients/recipients.routes';
import { paymentsRoutes } from './modules/payments/payments.routes';
import { transactionsRoutes } from './modules/transactions/transactions.routes';
import { qrRoutes } from './modules/qr/qr.routes';
import { receiptsRoutes } from './modules/receipts/receipts.routes';
import { notificationsRoutes } from './modules/notifications/notifications.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(compression());
app.use(correlationMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }),
);

// Swagger docs
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PayFlow API',
      version: '1.0.0',
      description:
        'PayFlow UPI Payment Simulator API — SIMULATION ONLY. No real money movement.',
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.routes.ts'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/api/v1/health', async (_req, res) => {
  try {
    const { prisma } = await import('./config/database');
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'connected',
      simulation: true,
    });
  } catch {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

// API v1 routes
const v1 = '/api/v1';
app.use(`${v1}/auth`, authRoutes);
app.use(`${v1}/users`, usersRoutes);
app.use(`${v1}/wallet`, walletsRoutes);
app.use(`${v1}/recipients`, recipientsRoutes);
app.use(`${v1}/payments`, paymentsRoutes);
app.use(`${v1}/transactions`, transactionsRoutes);
app.use(`${v1}/qr`, qrRoutes);
app.use(`${v1}/receipts`, receiptsRoutes);
app.use(`${v1}/notifications`, notificationsRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Centralized error handler (must be last)
app.use(errorMiddleware);

const PORT = env.PORT;
const server = app.listen(PORT, () => {
  logger.info(`PayFlow backend running on port ${PORT} [${env.NODE_ENV}]`);
  logger.info('⚠️  SIMULATION MODE — No real money movement');
});

export { app, server };
