import { ApiResponse, PageResponse } from '@/types/api'
import { axiosInstance } from './axios'
import { Product, CreateProductRequest, UpdateProductRequest, ProductQueryParams } from '@/types/product'

export const productApi = {
  // 获取产品列表
  getProducts: async (params: ProductQueryParams) => {
    const response = await axiosInstance.get<PageResponse<Product>>('/products', { params })
    return response.data
  },

  // 获取产品详情
  getProduct: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<Product>>(`/products/${id}`)
    return response.data
  },

  // 创建产品
  createProduct: async (data: CreateProductRequest) => {
    const response = await axiosInstance.post<ApiResponse<Product>>('/products', data)
    return response.data
  },

  // 更新产品
  updateProduct: async (id: string, data: UpdateProductRequest) => {
    const response = await axiosInstance.put<ApiResponse<Product>>(`/products/${id}`, data)
    return response.data
  },

  // 删除产品
  deleteProduct: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse<null>>(`/products/${id}`)
    return response.data
  },

  // 上传产品图片
  uploadImage: async (file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    const response = await axiosInstance.post<ApiResponse<{ url: string }>>('/upload/product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}
