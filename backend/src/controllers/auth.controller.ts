import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../ services/auth.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email, password } = req.body;
      const user = await AuthService.signup(username, email, password);
      return ApiResponse.success(res, user, 'User registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async signin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const data = await AuthService.signin(email, password);
      return ApiResponse.success(res, data, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await AuthService.forgotPassword(email);
      // Same response whether or not the email is registered, so this
      // endpoint can't be used to enumerate accounts.
      return ApiResponse.success(
        res,
        null,
        'If an account exists for that email, a reset link has been sent.',
      );
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      const data = await AuthService.resetPassword(token, password);
      return ApiResponse.success(res, data, 'Password reset successfully');
    } catch (error) {
      next(error);
    }
  }
}