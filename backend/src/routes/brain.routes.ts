import { Router, Request, Response, NextFunction } from 'express';
import { BrainService } from '../ services/brain.service.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

// Take the whole public page online / offline (Private route)
router.post('/share', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isPublic } = req.body;
    const result = await BrainService.toggleShare(req.user!.id, isPublic);
    return ApiResponse.success(res, result, 'Brain share status updated');
  } catch (error) {
    next(error);
  }
});

// Publish / unpublish a single content item (Private route)
router.post('/publish', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contentId, isPublic } = req.body;

    if (typeof contentId !== 'string' || typeof isPublic !== 'boolean') {
      return ApiResponse.error(res, 'contentId (string) and isPublic (boolean) are required', 400);
    }

    const result = await BrainService.setContentVisibility(req.user!.id, contentId, isPublic);
    if (!result) {
      return ApiResponse.error(res, 'Content not found or unauthorized', 404);
    }

    return ApiResponse.success(res, result, 'Content visibility updated');
  } catch (error) {
    next(error);
  }
});

// Access a single public item by hash + id (Public route)
router.get(
  '/:hash/item/:contentId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { hash, contentId } = req.params;
      if (typeof hash !== 'string' || typeof contentId !== 'string') {
        return ApiResponse.error(res, 'Invalid link', 400);
      }

      const data = await BrainService.getPublicContentItem(hash, contentId);
      return ApiResponse.success(res, data, 'Public item fetched successfully');
    } catch (error) {
      next(error);
    }
  }
);

// Access a full public brain by hash (Public route)
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
