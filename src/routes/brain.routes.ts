import { Router, Request, Response, NextFunction } from 'express';
import { BrainService } from '../ services/brain.service.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

// Share/Unshare toggle (Private route)
router.post('/share', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isPublic } = req.body;
    const result = await BrainService.toggleShare(req.user!.id, isPublic);
    return ApiResponse.success(res, result, 'Brain share status updated');
  } catch (error) {
    next(error);
  }
});

// Access public brain by hash (Public route)
router.get(
  '/:hash',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hash = req.params.hash;

      if (typeof hash !== 'string') {
        return ApiResponse.error(res, 'Invalid hash', 400);
      }

      const data = await BrainService.getPublicBrain(hash);

      return ApiResponse.success(
        res,
        data,
        'Public brain fetched successfully'
      );
    } catch (error) {
      next(error);
    }
  }
);

export default router;