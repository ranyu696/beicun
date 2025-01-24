import { PageResponse, ApiResponse } from '@/types/api'
import { axiosInstance } from './axios'
import type { Review, CreateReviewRequest, UpdateReviewRequest } from '@/types/review'

export const reviewApi = {
  getReviews: async (params: {
    page?: number
    pageSize?: number
    search?: string
    productId?: number
    userId?: number
    status?: Review['status']
  }) => {
    const response = await axiosInstance.get<PageResponse<Review>>('/reviews', { params })
    return response.data
  },

  getReview: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<Review>>(`/reviews/${id}`)
    return response.data
  },

  createReview: async (data: CreateReviewRequest) => {
    const response = await axiosInstance.post<ApiResponse<Review>>('/reviews', data)
    return response.data
  },

  updateReview: async (id: string, data: UpdateReviewRequest) => {
    const response = await axiosInstance.put<ApiResponse<Review>>(`/reviews/${id}`, data)
    return response.data
  },

  deleteReview: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse<null>>(`/reviews/${id}`)
    return response.data
  },

  uploadImage: async (file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    const response = await axiosInstance.post<ApiResponse<{ url: string }>>('/upload/review', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}
