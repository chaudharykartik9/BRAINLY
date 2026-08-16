// import { API } from './api';
// import type { ApiResponse } from '../types/api.types';
// import type { PublicBrainData, ShareBrainResponse } from '../types/brain.types';

// export const brainApi = {
//   toggleShare: async (isPublic: boolean): Promise<ApiResponse<ShareBrainResponse>> => {
//     const res = await API.post<ApiResponse<ShareBrainResponse>>('/brain/share', { isPublic });
//     return res.data;
//   },

//   getPublicBrain: async (hash: string): Promise<ApiResponse<PublicBrainData>> => {
//     const res = await API.get<ApiResponse<PublicBrainData>>(`/brain/${hash}`);
//     return res.data;
//   },
// };

import { API } from './api';
import type { ApiResponse } from '../types/api.types';
import type { PublicBrainData, ShareBrainResponse } from '../types/brain.types';

export const brainApi = {
  toggleShare: async (isPublic: boolean): Promise<ApiResponse<ShareBrainResponse>> => {
    const res = await API.post<ApiResponse<ShareBrainResponse>>('/brain/share', { isPublic });
    return res.data;
  },
  getPublicBrain: async (hash: string): Promise<ApiResponse<PublicBrainData>> => {
    const res = await API.get<ApiResponse<PublicBrainData>>(`/brain/${hash}`);
    return res.data;
  },
};