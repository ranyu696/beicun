// 产品评分相关类型
export interface ProductRating {
  id: string; // 评分ID
  productId: string; // 产品ID
  userId: string; // 用户ID
  rating: number; // 评分(1-5)
  reason?: string; // 评分理由
  createdAt: string; // 创建时间
}
