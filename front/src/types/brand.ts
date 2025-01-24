// 品牌实体
export interface Brand {
  id: string
  name: string
  description: string
  logo: string
  website?: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

// 品牌列表查询参数
export interface BrandListParams {
  page?: number
  pageSize?: number
  keyword?: string
  sortBy?: 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

// 品牌列表响应
export interface BrandListResponse {
  list: Brand[]
  total: number
  page: number
  pageSize: number
}
