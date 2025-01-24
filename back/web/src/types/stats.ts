// 产品统计
export interface ProductStats {
  id: string;
  name: string;
  viewCount: number;
  reviewCount: number;
  commentCount: number;
  averageRating: number;
}

// 测评统计
export interface ReviewStats {
  id: string;
  title: string;
  viewCount: number;
  createdAt: string;
  author: string;
}

// 活动统计
export interface ActivityStats {
  type: 'REVIEW' | 'COMMENT' | 'RATING';
  content: string;
  userName: string;
  createdAt: string;
}

// 产品类型统计
export interface ProductTypeStats {
  typeName: string;
  count: number;
}

// 品牌统计
export interface ProductBrandStats {
  brandName: string;
  count: number;
}

// 趋势统计
export interface TrendStats {
  date: string;
  count: number;
}

// 仪表盘统计
export interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalReviews: number;
  totalComments: number;
  pendingReviews: number;
  pendingComments: number;
  topProducts: ProductStats[];
  topReviews: ReviewStats[];
  recentActivities: ActivityStats[];
  productsByType: ProductTypeStats[];
  productsByBrand: ProductBrandStats[];
  reviewTrend: TrendStats[];
  commentTrend: TrendStats[];
}

// 用户统计
export interface UserStats {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersByRole: Record<string, number>;
  topReviewers: TopReviewer[];
}

// 热门评论者
export interface TopReviewer {
  userId: string;
  username: string;
  reviewCount: number;
  averageRating: number;
}

// 产品统计
export interface ProductStatsData {
  totalProducts: number;
  productsByType: Record<string, number>;
  productsByUtility: Record<string, number>;
  topRatedProducts: TopRatedProduct[];
  mostReviewedProducts: MostReviewedProduct[];
}

// 热门评分产品
export interface TopRatedProduct {
  productId: string;
  name: string;
  averageRating: number;
  reviewCount: number;
}

// 最多评论产品
export interface MostReviewedProduct {
  productId: string;
  name: string;
  reviewCount: number;
  averageRating: number;
}

// 评分统计
export interface RatingStats {
  productId: string;
  productName: string;
  averageRating: number;
  totalRatings: number;
  ratingCounts: Record<number, number>;
  recentReviews: RecentReview[];
}

// 最近评论
export interface RecentReview {
  reviewId: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
}
