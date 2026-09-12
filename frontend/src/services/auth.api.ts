import { API } from './api';
import type { ApiResponse } from '../types/api.types';
import type { SigninInput, SignupInput, AuthResponse } from '../types/auth.types';

export const authApi = {
  signup: async (data: SignupInput): Promise<ApiResponse<AuthResponse>> => {
    const res = await API.post<ApiResponse<AuthResponse>>('/auth/signup', data);
    return res.data;
  },
  signin: async (data: SigninInput): Promise<ApiResponse<AuthResponse>> => {
    const res = await API.post<ApiResponse<AuthResponse>>('/auth/signin', data);
    return res.data;
  },
  forgotPassword: async (email: string): Promise<ApiResponse<null>> => {
    const res = await API.post<ApiResponse<null>>('/auth/forgot-password', { email });
    return res.data;
  },
  resetPassword: async (token: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    const res = await API.post<ApiResponse<AuthResponse>>('/auth/reset-password', {
      token,
      password,
    });
    return res.data;
  },
};
