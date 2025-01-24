// 类型种类
export type TypeKind = 'utility' | 'product' | 'channel' | 'material'

// 通用类型实体
export interface Type {
  id: string
  name: string
  description?: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

// 类型列表查询参数
export interface TypeListParams {
  page?: number
  pageSize?: number
  keyword?: string
}

// 类型列表响应
export interface TypeListResponse {
  list: Type[]
  total: number
  page: number
  pageSize: number
}
