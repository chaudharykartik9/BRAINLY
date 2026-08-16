import express, { Application } from 'express';
import cors from 'cors';
import rootRouter from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

export const createApp = (): Application => {
  const app = express();

  // 1. CORS Configuration (allow Vite dev origins)
  app.use(
    cors({
      origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // 2. Parse JSON body
  app.use(express.json());

  // 3. Mount API Routes
  app.use('/api/v1', rootRouter);

  // 4. Global Error Handler (must be last middleware)
  app.use(errorHandler);

  return app;
};