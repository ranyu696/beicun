// 评论相关类型
export interface Comment {
  id: string; // 评论ID
  reviewId: string; // 测评ID
  userId: string; // 用户ID
  parentId?: string; // 父评论ID，为空表示顶级评论
  replyToId?: string; // 回复用户ID，为空表示不是回复
  content: string; // 评论内容
  status: CommentStatus; // 状态
  level: number; // 评论层级
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
}
export type CommentStatus = "PENDING" | "APPROVED" | "REJECTED";

const CommentStatus = {
  Pending: "PENDING",
  Approved: "APPROVED",
  Rejected: "REJECTED",
} as const;
