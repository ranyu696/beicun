package service

import (
	"beicun/back/model"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/lib/pq"
	"github.com/gin-gonic/gin"
	"github.com/gosimple/slug"
	"gorm.io/gorm"
)

var (
	ErrReviewNotFound = errors.New("测评不存在")
	ErrInternal = errors.New("内部错误")
)

type CreateReviewRequest struct {
	Title       string   `json:"title" binding:"required"`
	Cover       string   `json:"cover" binding:"required"`
	ProductID   uint     `json:"productId" binding:"required"`
	Content     string   `json:"content" binding:"required"`
	Pros        []string `json:"pros" binding:"required,min=1"`
	Cons        []string `json:"cons" binding:"required,min=1"`
	Conclusion  string   `json:"conclusion" binding:"required"`
}

type UpdateReviewRequest struct {
	Title       string   `json:"title,omitempty"`
	Cover       string   `json:"cover,omitempty"`
	Content     string   `json:"content,omitempty"`
	Pros        []string `json:"pros,omitempty"`
	Cons        []string `json:"cons,omitempty"`
	Conclusion  string   `json:"conclusion,omitempty"`
	Status      string   `json:"status,omitempty"`
}

type ReviewResponse struct {
	ID            string         `json:"id"`
	Title         string         `json:"title"`
	Cover         string         `json:"cover"`
	Slug          string         `json:"slug"`
	Status        model.ReviewStatus `json:"status"`
	ProductID     uint        `json:"productId"`
	Product       *ProductBrief  `json:"product,omitempty"`
	UserID        string         `json:"userId"`
	Author        *UserBrief     `json:"author,omitempty"`
	Content       string         `json:"content"`
	Pros          []string       `json:"pros"`
	Cons          []string       `json:"cons"`
	Conclusion    string         `json:"conclusion"`
	Views         int            `json:"views"`
	IsRecommended bool           `json:"isRecommended"`
	PublishedAt   *string        `json:"publishedAt,omitempty"`
	CreatedAt     string         `json:"createdAt"`
	UpdatedAt     string         `json:"updatedAt"`
}

// ProductBrief 产品简要信息
type ProductBrief struct {
	ID               uint                 `json:"id"`
	Name             string               `json:"name"`
	Slug             string               `json:"slug"`
	MainImage        []model.MainImage    `json:"mainImage"`
	AverageRating    float64              `json:"averageRating"`
	TotalRatings     int                  `json:"totalRatings"`
	ViewCount        int                  `json:"viewCount"`
}

type UserBrief struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Avatar string `json:"avatar"`
}

type ReviewService struct {
	db *gorm.DB
	productService *ProductService
}

func NewReviewService(db *gorm.DB, productService *ProductService) *ReviewService {
	return &ReviewService{db: db, productService: productService}
}

// CreateReview 创建测评
func (s *ReviewService) CreateReview(c *gin.Context, userID string, req *CreateReviewRequest) (*ReviewResponse, error) {
	// 检查产品是否存在
	var product model.Product
	if err := s.db.First(&product, "id = ?", req.ProductID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrReviewNotFound
		}
		return nil, ErrInternal
	}

	review := &model.Review{
		Title:       req.Title,
		Cover:       req.Cover,
		Slug:        slug.Make(req.Title),
		ProductID:   req.ProductID,
		UserID:      userID,
		Content:     req.Content,
		Pros:        req.Pros,  // pq.StringArray 会自动处理类型转换
		Cons:        req.Cons,  // pq.StringArray 会自动处理类型转换
		Conclusion:  req.Conclusion,
		Status:      model.ReviewStatusPending,
	}

	if err := s.db.Create(review).Error; err != nil {
		return nil, ErrInternal
	}

	return s.getReviewResponse(review)
}

// UpdateReview 更新测评
func (s *ReviewService) UpdateReview(c *gin.Context, id string, req *UpdateReviewRequest) (*ReviewResponse, error) {
	review := &model.Review{}
	if err := s.db.First(review, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrReviewNotFound
		}
		return nil, ErrInternal
	}

	if req.Title != "" {
		review.Title = req.Title
		review.Slug = slug.Make(req.Title)
	}
	if req.Cover != "" {
		review.Cover = req.Cover
	}
	if req.Content != "" {
		review.Content = req.Content
	}
	if len(req.Pros) > 0 {
		review.Pros = pq.StringArray(req.Pros)
	}
	if len(req.Cons) > 0 {
		review.Cons = pq.StringArray(req.Cons)
	}
	if req.Conclusion != "" {
		review.Conclusion = req.Conclusion
	}
	if req.Status != "" {
		review.Status = model.ReviewStatus(req.Status)
	}

	if err := s.db.Save(review).Error; err != nil {
		return nil, ErrInternal
	}

	return s.getReviewResponse(review)
}

// DeleteReview 删除测评
func (s *ReviewService) DeleteReview(c *gin.Context, id string) error {
	result := s.db.Delete(&model.Review{}, "id = ?", id)
	if result.Error != nil {
		return ErrInternal
	}
	if result.RowsAffected == 0 {
		return ErrReviewNotFound
	}
	return nil
}

// GetReview 获取测评详情
func (s *ReviewService) GetReview(c *gin.Context, id string) (*ReviewResponse, error) {
	review := &model.Review{}
	if err := s.db.Preload("Product").Preload("Author").First(review, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrReviewNotFound
		}
		return nil, ErrInternal
	}

	// 增加浏览量
	if err := s.db.Model(review).UpdateColumn("views", gorm.Expr("views + ?", 1)).Error; err != nil {
		return nil, ErrInternal
	}

	return s.getReviewResponse(review)
}

// GetReviewBySlug 通过 slug 获取测评详情
func (s *ReviewService) GetReviewBySlug(c *gin.Context, slug string) (*ReviewResponse, error) {
	review := &model.Review{}
	if err := s.db.Preload("Product").Preload("Author").First(review, "slug = ?", slug).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrReviewNotFound
		}
		return nil, ErrInternal
	}

	// 增加浏览量
	if err := s.db.Model(review).UpdateColumn("views", gorm.Expr("views + ?", 1)).Error; err != nil {
		return nil, ErrInternal
	}

	return s.getReviewResponse(review)
}

// ListReviews 获取测评列表
func (s *ReviewService) ListReviews(c *gin.Context, page, pageSize int, status string) ([]*ReviewResponse, int64, error) {
	var total int64
	query := s.db.Model(&model.Review{})

	if status != "" {
		query = query.Where("status = ?", status)
	} else {
		// 默认只显示已发布的测评
		query = query.Where("status = ?", model.ReviewStatusPublished)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, ErrInternal
	}

	var reviews []*model.Review
	if err := query.Preload("Product").Preload("Author").
		Order("is_recommended DESC, created_at DESC").
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Find(&reviews).Error; err != nil {
		return nil, 0, ErrInternal
	}

	responses := make([]*ReviewResponse, len(reviews))
	for i, review := range reviews {
		response, err := s.getReviewResponse(review)
		if err != nil {
			return nil, 0, ErrInternal
		}
		responses[i] = response
	}

	return responses, total, nil
}

// ListProductReviews 获取产品的测评列表
func (s *ReviewService) ListProductReviews(c *gin.Context, productID uint, page, pageSize int) ([]*ReviewResponse, int64, error) {
	// 检查产品是否存在
	var product model.Product
	if err := s.db.First(&product, "id = ?", productID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, 0, fmt.Errorf("产品不存在")
		}
		return nil, 0, ErrInternal
	}

	var total int64
	query := s.db.Model(&model.Review{}).
		Where("product_id = ? AND status = ?", productID, model.ReviewStatusPublished)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, ErrInternal
	}

	var reviews []*model.Review
	if err := query.Preload("Product").Preload("Author").
		Order("is_recommended DESC, created_at DESC").
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Find(&reviews).Error; err != nil {
		return nil, 0, ErrInternal
	}

	responses := make([]*ReviewResponse, len(reviews))
	for i, review := range reviews {
		response, err := s.getReviewResponse(review)
		if err != nil {
			return nil, 0, ErrInternal
		}
		responses[i] = response
	}

	return responses, total, nil
}

// GetProductByReviewSlug 通过测评 slug 获取产品详情
func (s *ReviewService) GetProductByReviewSlug(c *gin.Context, slug string) (*ProductResponse, error) {
	// 获取测评信息
	review := &model.Review{}
	if err := s.db.First(review, "slug = ?", slug).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrReviewNotFound
		}
		return nil, ErrInternal
	}

	// 只返回已发布的测评
	if review.Status != model.ReviewStatusPublished {
		return nil, ErrReviewNotFound
	}

	// 通过产品服务获取产品详情
	product, err := s.productService.GetProduct(c, review.ProductID)
	if err != nil {
		return nil, err
	}

	return product, nil
}

// getReviewResponse 转换为响应结构
func (s *ReviewService) getReviewResponse(review *model.Review) (*ReviewResponse, error) {
	response := &ReviewResponse{
		ID:            review.ID,
		Title:         review.Title,
		Cover:         review.Cover,
		Slug:          review.Slug,
		Status:        review.Status,
		ProductID:     review.ProductID,
		UserID:        review.UserID,
		Content:       review.Content,
		Pros:          review.Pros,
		Cons:          review.Cons,
		Conclusion:    review.Conclusion,
		Views:         review.Views,
		IsRecommended: review.IsRecommended,
		CreatedAt:     review.CreatedAt.Format("2006-01-02 15:04:05"),
		UpdatedAt:     review.UpdatedAt.Format("2006-01-02 15:04:05"),
	}

	if review.PublishedAt != nil {
		publishedAt := review.PublishedAt.Format("2006-01-02 15:04:05")
		response.PublishedAt = &publishedAt
	}

	if review.Product != nil && review.Product.ID != 0 {
		productBrief, err := s.toProductBrief(review.Product)
		if err != nil {
			return nil, err
		}
		response.Product = productBrief
	}

	if review.Author.ID != "" {
		response.Author = &UserBrief{
			ID:     review.Author.ID,
			Name:   review.Author.Name,
			Avatar: review.Author.Avatar,
		}
	}

	return response, nil
}

func (s *ReviewService) toProductBrief(product *model.Product) (*ProductBrief, error) {
	var mainImages []model.MainImage
	
	if len(product.MainImage) > 0 {
		if err := json.Unmarshal(product.MainImage, &mainImages); err != nil {
			return nil, fmt.Errorf("解析主图数据失败: %v", err)
		}
	}

	return &ProductBrief{
		ID:            product.ID,
		Name:          product.Name,
		Slug:          product.Slug,
		MainImage:     mainImages,
		AverageRating: product.AverageRating,
		TotalRatings:  product.TotalRatings,
		ViewCount:     product.ViewCount,
	}, nil
}
