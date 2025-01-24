'use server'

import { fetchData } from '@/lib/fetch'
import { Product, ProductListParams, ProductListResponse } from '@/types/product'

// 缓存标签
const CACHE_TAGS = {
  products: 'products',
  product: 'product',
}

// 获取产品列表
export async function getProducts(params?: ProductListParams) {
  const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : ''
  return fetchData<ProductListResponse>(`/products${queryString}`, {
    tags: [CACHE_TAGS.products],
    revalidate: 60, // 1分钟
  })
}

// 获取单个产品（通过ID）
export async function getProduct(id: string) {
  return fetchData<Product>(`/products/${id}`, {
    tags: [CACHE_TAGS.product],
    revalidate: 60,
  })
}

// 获取单个产品（通过Slug）
export async function getProductBySlug(slug: string) {
  return fetchData<Product>(`/products/slug/${slug}`, {
    tags: [CACHE_TAGS.product],
    revalidate: 60,
  })
}

// 获取热门产品
export async function getHotProducts() {
  return fetchData<ProductListResponse>('/products?sort=popularity&limit=4&status=active', {
    tags: [CACHE_TAGS.products],
    revalidate: 300, // 5分钟
  })
}
// 获取品牌产品
export async function getBrandProducts() {
  return fetchData<ProductListResponse>('/products?sort=popularity&limit=4&status=active', {
    tags: [CACHE_TAGS.products],
    revalidate: 300, // 5分钟
  })
}

  
// 获取相关产品
export async function getRelatedProducts(productId: string) {
  return fetchData<ProductListResponse>(`/products/${productId}/related`, {
    tags: [CACHE_TAGS.products],
    revalidate: 300, // 5分钟
  })
}
