import { Router } from 'express';
import { z } from 'zod';
import { ContentController } from '../controllers/content.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

// This schema checks the data sent from the frontend/Postman
const createContentSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    type: z.enum(['twitter', 'youtube', 'article', 'link', 'document', 'thought']),
    link: z.string().url().optional().or(z.literal('')), // Optional link or empty string
    notes: z.string().optional(),                        // Optional text notes
    tags: z.array(z.string()).optional(),                // Array of tag names e.g. ["tech", "ideas"]
    isPinned: z.boolean().optional(),                    // Optional true/false
  }),
});

// Same shape as create, but every field is optional — only what's sent gets changed
const updateContentSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').optional(),
    type: z.enum(['twitter', 'youtube', 'article', 'link', 'document', 'thought']).optional(),
    link: z.string().url().optional().or(z.literal('')),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isPinned: z.boolean().optional(),
  }),
});

const bulkDeleteSchema = z.object({
  body: z.object({
    ids: z.array(z.string()).min(1, 'At least one id is required'),
  }),
});

// Protect all content routes with login check
router.use(authMiddleware);

// Routes
router.post('/', validate(createContentSchema), ContentController.create);
router.get('/', ContentController.getAll);
router.get('/tags', ContentController.getTags);
router.patch('/:contentId', validate(updateContentSchema), ContentController.update);
router.delete('/', validate(bulkDeleteSchema), ContentController.removeMany);
router.delete('/:contentId', ContentController.remove);

export default router;