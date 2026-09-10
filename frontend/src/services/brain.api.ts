import { API } from './api';
import type { ApiResponse } from '../types/api.types';
import type {
  PublicBrainData,
  PublicContentData,
  PublishResponse,
  ShareBrainResponse,
} from '../types/brain.types';

export const brainApi = {
  toggleShare: async (isPublic: boolean): Promise<ApiResponse<ShareBrainResponse>> => {
    const res = await API.post<ApiResponse<ShareBrainResponse>>('/brain/share', { isPublic });
    return res.data;
  },
  publish: async (contentId: string, isPublic: boolean): Promise<ApiResponse<PublishResponse>> => {
    const res = await API.post<ApiResponse<PublishResponse>>('/brain/publish', {
      contentId,
      isPublic,
    });
    return res.data;
  },
  getPublicBrain: async (hash: string): Promise<ApiResponse<PublicBrainData>> => {
    const res = await API.get<ApiResponse<PublicBrainData>>(`/brain/${hash}`);
    return res.data;
  },
  getPublicItem: async (
    hash: string,
    contentId: string,
  ): Promise<ApiResponse<PublicContentData>> => {
    const res = await API.get<ApiResponse<PublicContentData>>(
      `/brain/${hash}/item/${contentId}`,
    );
    return res.data;
  },
};
