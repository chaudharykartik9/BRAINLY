import { Router } from 'express';
import authRoutes from './auth.routes.js';
import contentRoutes from './content.routes.js';
import brainRoutes from './brain.routes.js';

const rootRouter = Router();
rootRouter.use('/brain', brainRoutes);


rootRouter.use('/auth', authRoutes);
rootRouter.use('/content', contentRoutes);

export default rootRouter;