// API 响应基础结构
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  total?: number
}

// 分页数据结构
export interface PageData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 分页请求参数
export interface PageParams {
  page?: number
  pageSize?: number
}

// 排序参数
export interface SortParams {
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

// 搜索参数
export interface SearchParams {
  search?: string
}
