import { API } from './api';
import type { ApiResponse } from '../types/api.types';
import type { IContent, CreateContentInput, UpdateContentInput } from '../types/content.types';

export const contentApi = {
  getAll: async (): Promise<ApiResponse<IContent[]>> => {
    const res = await API.get<ApiResponse<IContent[]>>('/content');
    return res.data;
  },
  create: async (data: CreateContentInput): Promise<ApiResponse<IContent>> => {
    const res = await API.post<ApiResponse<IContent>>('/content', data);
    return res.data;
  },
  update: async (contentId: string, data: UpdateContentInput): Promise<ApiResponse<IContent>> => {
    const res = await API.patch<ApiResponse<IContent>>(`/content/${contentId}`, data);
    return res.data;
  },
  delete: async (contentId: string): Promise<ApiResponse<{ message: string }>> => {
    const res = await API.delete<ApiResponse<{ message: string }>>(`/content/${contentId}`);
    return res.data;
  },
};
