'use server'

import { fetchData } from '@/lib/fetch'
import { Product } from '@/types/product'
import { Review, ReviewListParams, ReviewListResponse } from '@/types/review'

// 缓存标签
const CACHE_TAGS = {
  reviews: 'reviews',
  review: 'review',
  productReviews: 'product-reviews',
  userReviews: 'user-reviews',
}

// 获取测评列表
export async function getReviews(params?: ReviewListParams) {
  const queryString = params ? `?${new URLSearchParams({
    ...params,
    status: params.status || 'published',
    page: String(params.page || 1),
    pageSize: String(params.pageSize || 10)
  } as any).toString()}` : '?status=published'

  const response = await fetchData<ReviewListResponse>(`/reviews${queryString}`, {
    tags: [CACHE_TAGS.reviews],
    revalidate: 60,
  })

  return {
    reviews: response.list,
    total: response.total,
    page: response.page,
    pageSize: response.pageSize
  }
}

// 获取单个测评
export async function getReview(id: string) {
  return fetchData<Review>(`/reviews/${id}`, {
    tags: [CACHE_TAGS.review],
    revalidate: 60,
  })
}

// 获取产品的测评列表
export async function getProductReviews(productId: string, params?: ReviewListParams) {
  const queryString = params ? `?${new URLSearchParams({
    ...params,
    status: params.status || 'published',
    page: String(params.page || 1),
    pageSize: String(params.pageSize || 10)
  } as any).toString()}` : '?status=published'

  return fetchData<ReviewListResponse>(`/products/${productId}/reviews${queryString}`, {
    tags: [CACHE_TAGS.productReviews, `product-${productId}-reviews`],
    revalidate: 60,
  })
}

// 获取用户的测评列表
export async function getUserReviews(userId: string, params?: ReviewListParams) {
  const queryString = params ? `?${new URLSearchParams({
    ...params,
    status: params.status || 'published',
    page: String(params.page || 1),
    pageSize: String(params.pageSize || 10)
  } as any).toString()}` : '?status=published'

  return fetchData<ReviewListResponse>(`/users/${userId}/reviews${queryString}`, {
    tags: [CACHE_TAGS.userReviews, `user-${userId}-reviews`],
    revalidate: 60,
  })
}

// 通过 slug 获取测评
export async function getReviewBySlug(slug: string) {
  return fetchData<Review>(`/reviews/slug/${slug}`, {
    tags: [CACHE_TAGS.review],
    revalidate: 60,
  })
}

// 通过 slug 获取测评详情
export async function getReviewDetailBySlug(slug: string) {
  return fetchData<Review>(`/reviews/slug/${slug}`, {
    tags: [CACHE_TAGS.review],
    cache: false
  })
}

// 通过测评 slug 获取产品详情
export async function getProductByReviewSlug(slug: string) {
  return fetchData<Product>(`/reviews/slug/${slug}/product`, {
    tags: [CACHE_TAGS.review],
    cache: false
  })
}
