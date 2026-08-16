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
    type: z.enum(['tweet', 'youtube', 'article', 'audio', 'document', 'thought']),
    link: z.string().url().optional().or(z.literal('')), // Optional link or empty string
    notes: z.string().optional(),                        // Optional text notes
    tags: z.array(z.string()).optional(),                // Array of tag names e.g. ["tech", "ideas"]
    isPinned: z.boolean().optional(),                    // Optional true/false
  }),
});

// Protect all content routes with login check
router.use(authMiddleware);

// Routes
router.post('/', validate(createContentSchema), ContentController.create);
router.get('/', ContentController.getAll);
router.delete('/:contentId', ContentController.remove);

export default router;