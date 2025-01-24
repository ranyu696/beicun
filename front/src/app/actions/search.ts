'use server'

import { fetchData } from '@/lib/fetch'
import { ProductListResponse } from '@/types/product'
import { ReviewListResponse } from '@/types/review'
import { BrandListResponse } from '@/types/brand'

// 缓存标签
const CACHE_TAGS = {
  searchProducts: 'search-products',
  searchReviews: 'search-reviews',
  searchBrands: 'search-brands',
}

interface SearchParams {
  query: string
  page?: number
  pageSize?: number
  sort?: string
  filter?: Record<string, any>
}

// 搜索产品
export async function searchProducts(params: SearchParams) {
  const queryString = `?${new URLSearchParams({
    q: params.query,
    page: params.page?.toString() || '1',
    pageSize: params.pageSize?.toString() || '10',
    ...(params.sort ? { sort: params.sort } : {}),
    ...(params.filter || {})
  }).toString()}`

  return fetchData<ProductListResponse>(`/search/products${queryString}`, {
    tags: [CACHE_TAGS.searchProducts],
    revalidate: 60, // 1分钟
    cache: true, // 启用缓存
  })
}

// 搜索测评
export async function searchReviews(params: SearchParams) {
  const queryString = `?${new URLSearchParams({
    q: params.query,
    page: params.page?.toString() || '1',
    pageSize: params.pageSize?.toString() || '10',
    ...(params.sort ? { sort: params.sort } : {}),
    ...(params.filter || {})
  }).toString()}`

  return fetchData<ReviewListResponse>(`/search/reviews${queryString}`, {
    tags: [CACHE_TAGS.searchReviews],
    revalidate: 60,
    cache: true,
  })
}

// 搜索品牌
export async function searchBrands(params: SearchParams) {
  const queryString = `?${new URLSearchParams({
    q: params.query,
    page: params.page?.toString() || '1',
    pageSize: params.pageSize?.toString() || '10',
    ...(params.sort ? { sort: params.sort } : {}),
    ...(params.filter || {})
  }).toString()}`

  return fetchData<BrandListResponse>(`/search/brands${queryString}`, {
    tags: [CACHE_TAGS.searchBrands],
    revalidate: 60,
    cache: true,
  })
}

// 通用搜索（返回所有类型的结果）
export async function searchAll(query: string) {
  const [products, reviews, brands] = await Promise.all([
    searchProducts({ query, pageSize: 5 }),
    searchReviews({ query, pageSize: 5 }),
    searchBrands({ query, pageSize: 5 }),
  ])

  return {
    products,
    reviews,
    brands,
  }
}
