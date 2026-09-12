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
      const { type, tag, search, page, limit } = req.query;
      const result = await ContentService.getUserContents(req.user!.id, {
        type: typeof type === 'string' ? type : undefined,
        tag: typeof tag === 'string' ? tag : undefined,
        search: typeof search === 'string' ? search : undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      return ApiResponse.success(res, result, 'Contents fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getTags(req: Request, res: Response, next: NextFunction) {
    try {
      const tags = await ContentService.getUserTags(req.user!.id);
      return ApiResponse.success(res, tags, 'Tags fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { contentId } = req.params;

      if (!contentId || Array.isArray(contentId)) {
        return ApiResponse.error(res, 'Invalid content ID', 400);
      }

      const updated = await ContentService.updateContent(contentId, req.user!.id, req.body);

      if (!updated) {
        return ApiResponse.error(res, 'Content not found or unauthorized', 404);
      }

      return ApiResponse.success(res, updated, 'Content updated successfully');
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

      const deleted = await ContentService.deleteContent(contentId, req.user!.id);

      if (!deleted) {
        return ApiResponse.error(res, 'Content not found or unauthorized', 404);
      }

      return ApiResponse.success(res, null, 'Content deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async removeMany(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;
      const deletedCount = await ContentService.deleteManyContents(ids, req.user!.id);
      return ApiResponse.success(res, { deletedCount }, `${deletedCount} item(s) deleted`);
    } catch (error) {
      next(error);
    }
  }
}
