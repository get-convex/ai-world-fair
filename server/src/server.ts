import { api } from 'convex/_generated/api';
import { ConvexClient } from 'convex/browser';
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

import { gatherContextWithOpenAI } from './lib/openai';
import makeCall from './lib/twilio';

const logger = pino({ name: 'server start' });
const app = expressWs(express()).app;

// Set the application to trust the reverse proxy
app.set('trust proxy', true);
app.ws('/:requestId', (ws, req) => {
  console.log('WebSocket connection accepted');
  new MediaStreamHandler(ws, req.params.requestId);
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

if (env.NODE_ENV === 'development') {
  app.get('/twiml', (req, res) => {
    res.sendFile(path.join(__dirname, 'config/twilio/templates/streams.xml'));
  });
}

app.post('/request', (req, res) => {
  console.log('Request received', req.body);
  res.send('Request received');
});

app.get('/call/:number', (req, res) => {
  const number = req.params.number;
  //makeCall(number);
  res.send('Calling ' + number);
});

const client = new ConvexClient(process.env.CONVEX_URL || '');
const unsubscribe = client.onUpdate(api.requests.getPendingRequests, {}, async (pendingRequests) => {
  console.log(pendingRequests);
  // New pending request:
  // 1. Look up who it's for
  // 2. Interpret the request
  // 3. Kick off the request
  // 4. Update the request status
  if (pendingRequests.length > 0) {
    // Pluck em off
    const pendingRequest = pendingRequests[0];
    await client.mutation(api.requests.updateRequestStatus, {
      requestId: pendingRequest._id,
      status: 'inflight',
    });
    const fullRequest = await client.query(api.requests.getRequestById, {
      requestId: pendingRequest._id,
    });

    // Placeholder for auth :)
    const sessionName = fullRequest?.sessionName;
    const sessionUser = await client.query(api.sessionUsers.getSessionUserByEmail, {
      email: sessionName || '',
    });

    // What do we know about this user?
    const userContext = sessionUser?.context || [];
    const openAIContext = await gatherContextWithOpenAI(userContext, fullRequest?.requestMsg || '', []);

    // Save this context so we can use it for the upcoming phone call
    const updateContext = await client.mutation(api.requests.updateRequestStatusWithContext, {
      requestId: pendingRequest._id,
      context: openAIContext || '',
    });

    // Make the phone call
    makeCall('12268202062', pendingRequest._id);

    await client.mutation(api.requests.updateRequestStatus, {
      requestId: pendingRequest._id,
      status: 'calling',
    });
  }
});

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
