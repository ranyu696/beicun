// 产品实体
export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  height: number;
  width: number;
  length: number;
  channelLength: number;
  totalLength: number;
  weight: number;
  version: string;
  isReversible: boolean;
  stimulation: 'LOW' | 'MEDIUM' | 'HIGH';
  softness: 'ULTRA_SOFT' | 'SOFT' | 'MEDIUM' | 'HARD' | 'ULTRA_HARD';
  tightness: 'TIGHT' | 'MEDIUM' | 'LOOSE';
  smell: 'HIGH' | 'MEDIUM' | 'LOW';
  oiliness: 'HIGH' | 'MEDIUM' | 'LOW';
  durability: 'HIGH' | 'MEDIUM' | 'LOW';
  description?: string;
  taobaoUrl?: string;
  mainImage: MainImage[];
  salesImage: SalesImage[];
  videoUrl?: string;
  productImages?: ProductImage[];
  utilityTypeId: string;
  productTypeId: string;
  channelTypeId: string;
  brandId: string;
  materialTypeId: string;
  createdAt: string;
  updatedAt: string;
  status: 'ACTIVE' | 'INACTIVE';
  registrationDate: Date;
  brand: {
    id: string;
    name: string;
  };
}

// ProductImage 类型
export interface ProductImage {
  url: string;
  width: number;
  height: number;
  description: string;
  sort: number;
}

// SalesImage 类型
export interface SalesImage {
  url: string;
  width: number;
  height: number;
  sort: number;
}

// MainImage 类型
export interface MainImage {
  url: string;
  width: number;
  height: number;
  sort: number;
}

// 创建产品请求
export interface CreateProductRequest {
  name: string;
  slug: string;
  price: number;
  height: number;
  width: number;
  length: number;
  channelLength: number;
  totalLength: number;
  weight: number;
  version: string;
  isReversible: boolean;
  stimulation: 'LOW' | 'MEDIUM' | 'HIGH';
  softness: 'ULTRA_SOFT' | 'SOFT' | 'MEDIUM' | 'HARD' | 'ULTRA_HARD';
  tightness: 'TIGHT' | 'MEDIUM' | 'LOOSE';
  smell: 'HIGH' | 'MEDIUM' | 'LOW';
  oiliness: 'HIGH' | 'MEDIUM' | 'LOW';
  durability: 'HIGH' | 'MEDIUM' | 'LOW';
  description?: string;
  taobaoUrl?: string;
  mainImage: MainImage[];
  salesImage: SalesImage[];
  videoUrl?: string;
  productImages?: ProductImage[];
  utilityTypeId: string;
  productTypeId: string;
  channelTypeId: string;
  brandId: string;
  materialTypeId: string;
  registrationDate: Date;
}

// 更新产品请求
export type UpdateProductRequest = Partial<CreateProductRequest>;

// 产品查询参数
export interface ProductQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  brandId?: string;
  productTypeId?: string;
  channelTypeId?: string;
  materialTypeId?: string;
  utilityTypeId?: string;
}