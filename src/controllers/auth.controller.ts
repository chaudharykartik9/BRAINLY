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
}