'use server'

import { fetchData } from '@/lib/fetch'
import { Brand, BrandListParams, BrandListResponse } from '@/types/brand'
import { ProductListResponse } from '@/types/product'

// 缓存标签
const CACHE_TAGS = {
  brands: 'brands',
  brand: 'brand',
}

// 获取品牌列表
export async function getBrands(params?: BrandListParams) {
  const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : ''
  return fetchData<BrandListResponse>(`/brands${queryString}`, {
    tags: [CACHE_TAGS.brands],
    revalidate: 60,
  })
}

// 获取单个品牌
export async function getBrand(id: string) {
  return fetchData<Brand>(`/brands/${id}`, {
    tags: [CACHE_TAGS.brand],
    revalidate: 60,
  })
}

// 通过 slug 获取品牌
export async function getBrandBySlug(slug: string) {
  return fetchData<Brand>(`/brands/slug/${slug}`, {
    tags: [CACHE_TAGS.brand],
    revalidate: 60,
  })
}

// 获取热门品牌
export async function getHotBrands() {
  return fetchData<BrandListResponse>('/brands?sort=popularity&limit=4', {
    tags: [CACHE_TAGS.brands],
    revalidate: 300, // 5分钟
  })
}

// 获取品牌的产品列表
export async function getBrandProducts(slug: string) {
  return fetchData<ProductListResponse>(`/brands/slug/${slug}/products`, {
    tags: [CACHE_TAGS.brand, `brand-${slug}-products`],
    revalidate: 60,
  })
}
