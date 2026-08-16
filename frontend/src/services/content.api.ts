// import { API } from './api';
// import { ApiResponse } from '../types/api.types';
// import { CreateContentInput, IContent } from '../types/content.types';

// export const contentApi = {
//   getAll: async (): Promise<ApiResponse<IContent[]>> => {
//     const res = await API.get<ApiResponse<IContent[]>>('/content');
//     return res.data;
//   },

//   create: async (data: CreateContentInput): Promise<ApiResponse<IContent>> => {
//     const res = await API.post<ApiResponse<IContent>>('/content', data);
//     return res.data;
//   },

//   delete: async (contentId: string): Promise<ApiResponse<null>> => {
//     const res = await API.delete<ApiResponse<null>>(`/content/${contentId}`);
//     return res.data;
//   },
// };

// import { API } from './api';
// import type { ApiResponse } from '../types/api.types';
// import type { IContent, CreateContentInput } from '../types/content.types';

// export const contentApi = {
//   getAll: () => API.get<ApiResponse<IContent[]>>('/content'),
//   create: (data: CreateContentInput) => API.post<ApiResponse<IContent>>('/content', data),
//   delete: (contentId: string) => API.delete<ApiResponse<{ message: string }>>(`/content/${contentId}`),
// };


import { API } from './api';
import type { ApiResponse } from '../types/api.types';
import type { IContent, CreateContentInput } from '../types/content.types';

export const contentApi = {
  getAll: async (): Promise<ApiResponse<IContent[]>> => {
    const res = await API.get<ApiResponse<IContent[]>>('/content');
    return res.data;
  },
  create: async (data: CreateContentInput): Promise<ApiResponse<IContent>> => {
    const res = await API.post<ApiResponse<IContent>>('/content', data);
    return res.data;
  },
  delete: async (contentId: string): Promise<ApiResponse<{ message: string }>> => {
    const res = await API.delete<ApiResponse<{ message: string }>>(`/content/${contentId}`);
    return res.data;
  },
};