import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/ logger.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(err.stack || err.message);
  ApiResponse.error(res, err.message || 'Internal Server Error', 500);
};