export interface ProductModel {
    id: string
    name: string
    slug: string
    price: number
    brandId: string
    productTypeId: string
    channelTypeId: string
    materialTypeId: string
    description?: string
    taobaoUrl?: string
    registrationDate: Date
    height: number
    width: number
    length: number
    channelLength: number
    totalLength: number
    weight: number
    version: string
    isReversible: boolean
    stimulation: 'LOW' | 'MEDIUM' | 'HIGH'
    softness: 'ULTRA_SOFT' | 'SOFT' | 'MEDIUM' | 'HARD' | 'ULTRA_HARD'
    tightness: 'TIGHT' | 'MEDIUM' | 'LOOSE'
    smell: 'HIGH' | 'MEDIUM' | 'LOW'
    oiliness: 'HIGH' | 'MEDIUM' | 'LOW'
    mainImage: string
    salesImage: string
    videoUrl?: string
    detailImages: string[]
    ProductImage?: {
      id: string
      imageUrl: string
      sortOrder: number
    }[]
    tags?: {
      id: string
      tagId: string
    }[]
  }