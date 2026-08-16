import { Request, Response, NextFunction } from 'express';
import { ContentService } from '../ services/ content.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class ContentController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const content = await ContentService.createContent(req.body, req.user!.id);
      return ApiResponse.success(res, content, 'Content created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const contents = await ContentService.getUserContents(req.user!.id);
      return ApiResponse.success(res, contents, 'Contents fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
  try {
    const { contentId } = req.params;

    if (!contentId || Array.isArray(contentId)) {
      return ApiResponse.error(res, 'Invalid content ID', 400);
    }

    const deleted = await ContentService.deleteContent(
      contentId,
      req.user!.id
    );

    if (!deleted) {
      return ApiResponse.error(
        res,
        'Content not found or unauthorized',
        404
      );
    }

    return ApiResponse.success(
      res,
      null,
      'Content deleted successfully'
    );
  } catch (error) {
    next(error);
  }
  }
}