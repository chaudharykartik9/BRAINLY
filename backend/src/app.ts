import express, { Application } from 'express';
//import cors from 'cors';
import { ENV } from './config/env.js';
import rootRouter from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

export const createApp = (): Application => {
  const app = express();

  // Global Middlewares
  //app.use(cors({ origin: ENV.CORS_ORIGIN }));
  app.use(express.json());

  // Mount API Version 1
  app.use('/api/v1', rootRouter);

  // Global Error Handler
  app.use(errorHandler);

  return app;
};