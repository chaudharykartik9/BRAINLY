import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';
import { logger } from './utils/ logger.js';

const startServer = async () => {
  await connectDB();

  const app = createApp();

  app.listen(ENV.PORT, () => {
    logger.info(`Server running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`);
  });
};

startServer();