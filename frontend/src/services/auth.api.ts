// import { API } from './api';
// import { ApiResponse } from '../types/api.types';
// import { AuthResponseData, SigninInput, SignupInput } from '../types/auth.types';

// export const authApi = {
//   signup: async (data: SignupInput): Promise<ApiResponse<AuthResponseData>> => {
//     const res = await API.post<ApiResponse<AuthResponseData>>('/auth/signup', data);
//     return res.data;
//   },

//   signin: async (data: SigninInput): Promise<ApiResponse<AuthResponseData>> => {
//     const res = await API.post<ApiResponse<AuthResponseData>>('/auth/signin', data);
//     return res.data;
//   },
// };
// import { API } from './api';
// import type { ApiResponse } from '../types/api.types';
// import type { SigninInput, SignupInput, AuthResponse } from '../types/auth.types';

// export const authApi = {
//   signup: (data: SignupInput) => API.post<ApiResponse<AuthResponse>>('/auth/signup', data),
//   signin: (data: SigninInput) => API.post<ApiResponse<AuthResponse>>('/auth/signin', data),
// };


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
};