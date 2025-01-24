import { PageResponse } from '@/types/api';
import { axiosInstance } from './axios';
import type { Type, CreateTypeRequest, UpdateTypeRequest, TypeQueryParams } from '@/types/type';

// 创建基础类型 API 服务
const createTypeApi = (baseUrl: string) => ({
  // 获取类型列表
  getTypes: async (params: TypeQueryParams) => {
    const response = await axiosInstance.get<PageResponse<Type>>(`/${baseUrl}`, { params });
    return response.data;
  },

  // 获取类型详情
  getType: async (id: string) => {
    const response = await axiosInstance.get<Type>(`/${baseUrl}/${id}`);
    return response.data;
  },

  // 创建类型
  createType: async (data: CreateTypeRequest) => {
    const response = await axiosInstance.post<Type>(`/${baseUrl}`, data);
    return response.data;
  },

  // 更新类型
  updateType: async (id: string, data: UpdateTypeRequest) => {
    const response = await axiosInstance.put<Type>(`/${baseUrl}/${id}`, data);
    return response.data;
  },

  // 删除类型
  deleteType: async (id: string) => {
    const response = await axiosInstance.delete(`/${baseUrl}/${id}`);
    return response.data;
  },
});

// 器具类型 API
export const utilityTypeApi = createTypeApi('utility-types');

// 产品类型 API
export const productTypeApi = createTypeApi('product-types');

// 通道类型 API
export const channelTypeApi = createTypeApi('channel-types');

// 材料类型 API
export const materialTypeApi = createTypeApi('material-types');
