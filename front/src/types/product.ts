import { User } from './user'
import { Review } from './review'
import { Rating } from './rating'

// 刺激度级别
export enum StimulationLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

// 软度级别
export enum SoftnessLevel {
  ULTRA_SOFT = 'ULTRA_SOFT',
  SOFT = 'SOFT',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  ULTRA_HARD = 'ULTRA_HARD',
}

// 紧度级别
export enum TightnessLevel {
  TIGHT = 'TIGHT',
  MEDIUM = 'MEDIUM',
  LOOSE = 'LOOSE',
}

// 通用级别
export enum Level {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

// 耐用性级别
export enum DurabilityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

// 主图类型
export interface MainImage {
  url: string
  width: number
  height: number
  sort: number
}

// 销售图类型
export interface SalesImage {
  url: string
  width: number
  height: number
  sort: number
}

// 产品详情图类型
export interface ProductImage {
  url: string
  width: number
  height: number
  sort: number
  description: string
}

// 产品标签类型
export interface ProductTag {
  id: string
  productId: string
  tagId: string
}

// 产品状态
export type ProductStatus = 'active' | 'inactive' | 'draft'

// 产品类型
export interface Product {
  id: string
  name: string
  slug: string
  registrationDate: string
  price: number
  height: number
  width: number
  length: number
  channelLength: number
  totalLength: number
  weight: number
  version: string
  isReversible: boolean
  stimulation: StimulationLevel
  softness: SoftnessLevel
  tightness: TightnessLevel
  smell: Level
  oiliness: Level
  durability: DurabilityLevel
  description?: string
  taobaoUrl?: string
  mainImage: MainImage[]
  salesImage: SalesImage[]
  productImages: ProductImage[]
  videoUrl?: string
  averageRating: number
  totalRatings: number
  viewCount: number
  createdAt: string
  updatedAt: string
  status: ProductStatus
  brandId: string
  brand: {
    id: string
    name: string
  }
  typeId: string
  type: {
    id: string
    name: string
  }

  // 关联
  userId: string
  user: User
  utilityTypeId: string
  utilityType: { id: string; name: string }
  productTypeId: string
  productType: { id: string; name: string }
  channelTypeId: string
  channelType: { id: string; name: string }
  materialTypeId: string
  materialType: { id: string; name: string }

  // 其他关联
  ratings?: Rating[]
  tags?: ProductTag[]
  reviews?: Review[]
}

// 产品列表查询参数
export interface ProductListParams {
  page?: number
  pageSize?: number
  brandId?: string
  typeId?: string
  status?: ProductStatus
  minPrice?: number
  maxPrice?: number
  search?: string
}

// 产品列表响应
export interface ProductListResponse {
  list: Product[]
  total: number
  page: number
  pageSize: number
}