import { Router } from 'express';
import { z } from 'zod';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { signinLimiter, signupLimiter, forgotPasswordLimiter } from '../middlewares/rateLimit.js';

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

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(6),
  }),
});

router.post('/signup', signupLimiter, validate(signupSchema), AuthController.signup);
router.post('/signin', signinLimiter, validate(signinSchema), AuthController.signin);
router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  AuthController.forgotPassword,
);
router.post('/reset-password', validate(resetPasswordSchema), AuthController.resetPassword);

export default router;