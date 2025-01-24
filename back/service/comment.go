package service

import (
	"beicun/back/model"
	"errors"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var (
	ErrCommentNotFound = errors.New("评论不存在")
	ErrInvalidComment  = errors.New("无效的评论")
)

type CreateCommentRequest struct {
	ReviewID  string  `json:"reviewId" binding:"required"`
	Content   string  `json:"content" binding:"required,min=1,max=1000"`
	ParentID  *string `json:"parentId,omitempty"`
	ReplyToID *string `json:"replyToId,omitempty"`
}

type UpdateCommentRequest struct {
	Content string `json:"content" binding:"required,min=1,max=1000"`
}

type UpdateCommentStatusRequest struct {
	Status model.CommentStatus `json:"status" binding:"required,oneof=PENDING PUBLISHED REJECTED"`
}

type CommentResponse struct {
	ID        string             `json:"id"`
	ReviewID  string             `json:"reviewId"`
	Content   string             `json:"content"`
	Status    model.CommentStatus `json:"status"`
	Level     int                `json:"level"`
	CreatedAt string             `json:"createdAt"`
	UpdatedAt string             `json:"updatedAt"`
	User      *UserBrief         `json:"user"`
	ReplyTo   *UserBrief         `json:"replyTo,omitempty"`
	Replies   []*CommentResponse `json:"replies,omitempty"`
}


type CommentService struct {
	db *gorm.DB
}

func NewCommentService(db *gorm.DB) *CommentService {
	return &CommentService{db: db}
}

// CreateComment 创建评论
func (s *CommentService) CreateComment(c *gin.Context, userID string, req *CreateCommentRequest) (*CommentResponse, error) {
	// 检查测评是否存在
	var review model.Review
	if err := s.db.First(&review, "id = ?", req.ReviewID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrReviewNotFound
		}
		return nil, ErrInternal
	}

	// 如果是回复评论，检查父评论是否存在
	var level = 1
	if req.ParentID != nil {
		var parentComment model.Comment
		if err := s.db.First(&parentComment, "id = ?", req.ParentID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, ErrCommentNotFound
			}
			return nil, ErrInternal
		}
		level = parentComment.Level + 1
		if level > 3 { // 限制评论层级最多为3层
			return nil, ErrInvalidComment
		}
	}

	comment := &model.Comment{
		ReviewID:  req.ReviewID,
		UserID:    userID,
		ParentID:  req.ParentID,
		ReplyToID: req.ReplyToID,
		Content:   req.Content,
		Status:    model.CommentStatusPending,
		Level:     level,
	}

	if err := s.db.Create(comment).Error; err != nil {
		return nil, ErrInternal
	}

	return s.getCommentResponse(comment)
}

// UpdateComment 更新评论
func (s *CommentService) UpdateComment(c *gin.Context, id string, userID string, req *UpdateCommentRequest) (*CommentResponse, error) {
	comment := &model.Comment{}
	if err := s.db.First(comment, "id = ? AND user_id = ?", id, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCommentNotFound
		}
		return nil, ErrInternal
	}

	comment.Content = req.Content
	if err := s.db.Save(comment).Error; err != nil {
		return nil, ErrInternal
	}

	return s.getCommentResponse(comment)
}

// UpdateCommentStatus 更新评论状态（管理员操作）
func (s *CommentService) UpdateCommentStatus(c *gin.Context, id string, req *UpdateCommentStatusRequest) (*CommentResponse, error) {
	comment := &model.Comment{}
	if err := s.db.First(comment, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCommentNotFound
		}
		return nil, ErrInternal
	}

	comment.Status = req.Status
	if err := s.db.Save(comment).Error; err != nil {
		return nil, ErrInternal
	}

	return s.getCommentResponse(comment)
}

// DeleteComment 删除评论
func (s *CommentService) DeleteComment(c *gin.Context, id string, userID string) error {
	result := s.db.Where("id = ? AND user_id = ?", id, userID).Delete(&model.Comment{})
	if result.Error != nil {
		return ErrInternal
	}
	if result.RowsAffected == 0 {
		return ErrCommentNotFound
	}
	return nil
}

// GetComment 获取评论详情
func (s *CommentService) GetComment(c *gin.Context, id string) (*CommentResponse, error) {
	comment := &model.Comment{}
	if err := s.db.Preload("User").Preload("ReplyTo").First(comment, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCommentNotFound
		}
		return nil, ErrInternal
	}

	return s.getCommentResponse(comment)
}

// ListComments 获取评论列表
func (s *CommentService) ListComments(c *gin.Context, reviewSlug string, page, pageSize int, status string) ([]*CommentResponse, int64, error) {
	var total int64
	var review model.Review
	
	// 先通过 slug 获取 review
	if err := s.db.Where("slug = ?", reviewSlug).First(&review).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, 0, ErrReviewNotFound
		}
		return nil, 0, ErrInternal
	}

	query := s.db.Model(&model.Comment{}).Where("review_id = ? AND parent_id IS NULL", review.ID)

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, ErrInternal
	}

	var comments []*model.Comment
	if err := query.Preload("User").Preload("ReplyTo").
		Order("created_at DESC").
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Find(&comments).Error; err != nil {
		return nil, 0, ErrInternal
	}

	// 获取每个顶级评论的回复
	responses := make([]*CommentResponse, len(comments))
	for i, comment := range comments {
		response, err := s.getCommentWithReplies(comment)
		if err != nil {
			return nil, 0, err
		}
		responses[i] = response
	}

	return responses, total, nil
}

// ListAllComments 获取所有评论（管理员用）
func (s *CommentService) ListAllComments(c *gin.Context, page, pageSize int, status string) ([]*CommentResponse, int64, error) {
	var total int64
	query := s.db.Model(&model.Comment{})

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, ErrInternal
	}

	var comments []*model.Comment
	if err := query.Preload("User").Preload("ReplyTo").
		Order("created_at DESC").
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Find(&comments).Error; err != nil {
		return nil, 0, ErrInternal
	}

	responses := make([]*CommentResponse, len(comments))
	for i, comment := range comments {
		response, err := s.getCommentResponse(comment)
		if err != nil {
			return nil, 0, err
		}
		responses[i] = response
	}

	return responses, total, nil
}

// getCommentWithReplies 获取评论及其回复
func (s *CommentService) getCommentWithReplies(comment *model.Comment) (*CommentResponse, error) {
	response, err := s.getCommentResponse(comment)
	if err != nil {
		return nil, err
	}

	// 获取回复
	var replies []*model.Comment
	if err := s.db.Preload("User").Preload("ReplyTo").
		Where("parent_id = ?", comment.ID).
		Order("created_at ASC").
		Find(&replies).Error; err != nil {
		return nil, ErrInternal
	}

	if len(replies) > 0 {
		response.Replies = make([]*CommentResponse, len(replies))
		for i, reply := range replies {
			replyResponse, err := s.getCommentResponse(reply)
			if err != nil {
				return nil, err
			}
			response.Replies[i] = replyResponse
		}
	}

	return response, nil
}

// getCommentResponse 转换为响应结构
func (s *CommentService) getCommentResponse(comment *model.Comment) (*CommentResponse, error) {
	response := &CommentResponse{
		ID:        comment.ID,
		ReviewID:  comment.ReviewID,
		Content:   comment.Content,
		Status:    comment.Status,
		Level:     comment.Level,
		CreatedAt: comment.CreatedAt.Format("2006-01-02 15:04:05"),
		UpdatedAt: comment.UpdatedAt.Format("2006-01-02 15:04:05"),
	}

	if comment.User.ID != "" {
		response.User = &UserBrief{
			ID:     comment.User.ID,
			Name:   comment.User.Name,
			Avatar: comment.User.Avatar,
		}
	}

	if comment.ReplyTo != nil && comment.ReplyTo.ID != "" {
		response.ReplyTo = &UserBrief{
			ID:     comment.ReplyTo.ID,
			Name:   comment.ReplyTo.Name,
			Avatar: comment.ReplyTo.Avatar,
		}
	}

	return response, nil
}
