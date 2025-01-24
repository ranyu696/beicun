package service

import (
	"beicun/back/model"
	"errors"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// UserService 用户服务
type UserService struct {
	db *gorm.DB
}

// NewUserService 创建用户服务实例
func NewUserService(db *gorm.DB) *UserService {
	return &UserService{
		db: db,
	}
}

// GetUserByEmail 通过邮箱获取用户
func (s *UserService) GetUserByEmail(c *gin.Context, email string) (*model.User, error) {
	var user model.User
	if err := s.db.WithContext(c).Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("用户不存在")
		}
		return nil, err
	}
	return &user, nil
}

// CreateUser 创建新用户
func (s *UserService) CreateUser(c *gin.Context, user *model.User) error {
	return s.db.WithContext(c).Create(user).Error
}

// GetCurrentUser 获取当前用户信息
func (s *UserService) GetCurrentUser(c *gin.Context, userID string) (*model.User, error) {
	var user model.User
	if err := s.db.WithContext(c).First(&user, "id = ?", userID).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// UpdateCurrentUser 更新当前用户信息
func (s *UserService) UpdateCurrentUser(c *gin.Context, userID string, updates map[string]interface{}) (*model.User, error) {
	var user model.User
	if err := s.db.WithContext(c).First(&user, "id = ?", userID).Error; err != nil {
		return nil, err
	}

	if err := s.db.WithContext(c).Model(&user).Updates(updates).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// ListCurrentUserReviews 获取当前用户的测评列表
func (s *UserService) ListCurrentUserReviews(c *gin.Context, userID string, page, pageSize int) ([]model.Review, int64, error) {
	var reviews []model.Review
	var total int64

	query := s.db.WithContext(c).Model(&model.Review{}).Where("user_id = ?", userID)
	
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Offset((page - 1) * pageSize).Limit(pageSize).Find(&reviews).Error; err != nil {
		return nil, 0, err
	}

	return reviews, total, nil
}

// ListCurrentUserFavorites 获取当前用户的收藏列表
func (s *UserService) ListCurrentUserFavorites(c *gin.Context, userID string, page, pageSize int) ([]model.Product, int64, error) {
	var products []model.Product
	var total int64

	query := s.db.WithContext(c).Model(&model.Product{}).
		Joins("JOIN user_favorites ON user_favorites.product_id = products.id").
		Where("user_favorites.user_id = ?", userID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Offset((page - 1) * pageSize).Limit(pageSize).Find(&products).Error; err != nil {
		return nil, 0, err
	}

	return products, total, nil
}

// AddToFavorites 添加收藏
func (s *UserService) AddToFavorites(c *gin.Context, userID, productID string) error {
	// 检查产品是否存在
	var product model.Product
	if err := s.db.WithContext(c).First(&product, "id = ?", productID).Error; err != nil {
		return err
	}

	// 检查是否已经收藏
	var count int64
	s.db.WithContext(c).Model(&model.UserFavorite{}).
		Where("user_id = ? AND product_id = ?", userID, productID).
		Count(&count)
	if count > 0 {
		return errors.New("已经收藏过了")
	}

	// 添加收藏
	favorite := model.UserFavorite{
		UserID:    userID,
		ProductID: productID,
	}
	return s.db.WithContext(c).Create(&favorite).Error
}

// RemoveFromFavorites 取消收藏
func (s *UserService) RemoveFromFavorites(c *gin.Context, userID, productID string) error {
	return s.db.WithContext(c).Where("user_id = ? AND product_id = ?", userID, productID).
		Delete(&model.UserFavorite{}).Error
}

// ListUsers 获取用户列表（管理员）
func (s *UserService) ListUsers(c *gin.Context, page, pageSize int) ([]model.User, int64, error) {
	var users []model.User
	var total int64

	if err := s.db.WithContext(c).Model(&model.User{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := s.db.WithContext(c).Offset((page - 1) * pageSize).Limit(pageSize).Find(&users).Error; err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

// GetUser 获取单个用户信息（管理员）
func (s *UserService) GetUser(c *gin.Context, userID string) (*model.User, error) {
	var user model.User
	if err := s.db.WithContext(c).First(&user, "id = ?", userID).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// UpdateUser 更新用户信息（管理员）
func (s *UserService) UpdateUser(c *gin.Context, userID string, updates map[string]interface{}) (*model.User, error) {
	var user model.User
	if err := s.db.WithContext(c).First(&user, "id = ?", userID).Error; err != nil {
		return nil, err
	}

	if err := s.db.WithContext(c).Model(&user).Updates(updates).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// DeleteUser 删除用户（管理员）
func (s *UserService) DeleteUser(c *gin.Context, userID string) error {
	return s.db.WithContext(c).Delete(&model.User{}, "id = ?", userID).Error
}

// UpdateUserStatus 更新用户状态（管理员）
func (s *UserService) UpdateUserStatus(c *gin.Context, userID string, status model.UserStatus) error {
	return s.db.WithContext(c).Model(&model.User{}).Where("id = ?", userID).Update("status", status).Error
}
