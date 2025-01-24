import { Product } from "./product";
import { User } from "./user";
import { Comment } from "./comment";

// 测评相关类型
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CreateReviewRequest {
  title: string;
  productId: number;
  content: string;
  pros: string[];
  cons: string[];
  conclusion: string;
  cover: string;
}

export interface UpdateReviewRequest {
  title?: string;
  content?: string;
  pros?: string[];
  cons?: string[];
  conclusion?: string;
  status?: ReviewStatus;
  cover?: string;
}

export interface Review {
  id: string;
  title: string;
  content: string;
  cover: string;
  pros: string[];
  cons: string[];
  conclusion: string;
  images?: string[];
  userId: string;
  productId: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  views: number;
  isRecommended: boolean;
  product: Product;
  author: User;
  comments: Comment[];
}
