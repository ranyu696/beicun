// 品牌实体
export interface Brand {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// 创建品牌请求
export interface CreateBrandRequest {
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  sortOrder: number;
}

// 更新品牌请求
export interface UpdateBrandRequest {
  name?: string;
  description?: string;
  logo?: string;
  website?: string;
  sortOrder?: number;
}

// 品牌查询参数
export interface BrandQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  sortBy?: 'updatedAt' | '';
  sortOrder?: 'asc' | 'desc';
}
