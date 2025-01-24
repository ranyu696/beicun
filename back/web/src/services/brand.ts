import { Brand, BrandQueryParams, CreateBrandRequest, UpdateBrandRequest } from '@/types/brand';
import { ApiResponse, PageResponse } from '@/types/api';
import { axiosInstance } from './axios';

export const brandApi = {
  // 获取品牌列表
  getBrands: async (params: BrandQueryParams) => {
    const response = await axiosInstance.get<PageResponse<Brand>>('/brands', { params });
    return response.data;
  },

  // 获取单个品牌
  getBrand: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<Brand>>(`/brands/${id}`);
    return response.data;
  },

  // 创建品牌
  createBrand: async (data: CreateBrandRequest) => {
    const response = await axiosInstance.post<ApiResponse<Brand>>('/brands', data);
    return response.data;
  },

  // 更新品牌
  updateBrand: async (id: string, data: UpdateBrandRequest) => {
    const response = await axiosInstance.put<ApiResponse<Brand>>(`/brands/${id}`, data);
    return response.data;
  },

  // 删除品牌
  deleteBrand: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse<null>>(`/brands/${id}`);
    return response.data;
  },
};
