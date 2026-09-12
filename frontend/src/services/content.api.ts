import { API } from './api';
import type { ApiResponse } from '../types/api.types';
import type {
  IContent,
  CreateContentInput,
  UpdateContentInput,
  PaginatedContent,
  GetContentParams,
  TagCount,
} from '../types/content.types';

export const contentApi = {
  getAll: async (params: GetContentParams = {}): Promise<ApiResponse<PaginatedContent>> => {
    const res = await API.get<ApiResponse<PaginatedContent>>('/content', { params });
    return res.data;
  },
  getTags: async (): Promise<ApiResponse<TagCount[]>> => {
    const res = await API.get<ApiResponse<TagCount[]>>('/content/tags');
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
  deleteMany: async (ids: string[]): Promise<ApiResponse<{ deletedCount: number }>> => {
    const res = await API.delete<ApiResponse<{ deletedCount: number }>>('/content', {
      data: { ids },
    });
    return res.data;
  },
};
