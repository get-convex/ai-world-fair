import cors from 'cors';
import express from 'express';
import expressWs from 'express-ws';
import helmet from 'helmet';
import path from 'path';
import { pino } from 'pino';

import { healthCheckRouter } from '@/api/healthCheck/healthCheckRouter';
import { userRouter } from '@/api/user/userRouter';
import { openAPIRouter } from '@/api-docs/openAPIRouter';
import errorHandler from '@/common/middleware/errorHandler';
import rateLimiter from '@/common/middleware/rateLimiter';
import requestLogger from '@/common/middleware/requestLogger';
import { env } from '@/common/utils/envConfig';
import MediaStreamHandler from '@/lib/stream-handlers/MediaStreamHandler';

const logger = pino({ name: 'server start' });
const app = expressWs(express()).app;

// Set the application to trust the reverse proxy
app.set('trust proxy', true);
app.ws('/', (ws) => {
  console.log('WebSocket connection accepted');
  new MediaStreamHandler(ws);
});

// Middlewares
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Routes
app.use('/health-check', healthCheckRouter);
app.use('/users', userRouter);

// Serve up streams.xml for Twilio WSS connection:
// https://[host]/stream/streams.xml
app.post('/twiml', (req, res) => {
  res.sendFile(path.join(__dirname, 'config/twilio/templates/streams.xml'));
});

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
