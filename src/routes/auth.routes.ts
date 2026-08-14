import { Router } from 'express';
import { z } from 'zod';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

const signupSchema = z.object({
  body: z.object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

const signinSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

router.post('/signup', validate(signupSchema), AuthController.signup);
router.post('/signin', validate(signinSchema), AuthController.signin);

export default router;