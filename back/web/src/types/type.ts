// 通用类型实体
export type TypeKind = 'utility' | 'product' | 'channel' | 'material'

export interface Type {
  id: string
  name: string
  description?: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}


// 类型查询参数
export interface TypeQueryParams {
  keyword?: string
  page?: number
  pageSize?: number
}

// 创建类型请求
export interface CreateTypeRequest {
  name: string
  description?: string  
  sortOrder: number
}

// 更新类型请求
export interface UpdateTypeRequest {
  name: string
  description?: string
  sortOrder: number
}