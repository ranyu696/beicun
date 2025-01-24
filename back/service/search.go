package service

import (
	"gorm.io/gorm"

	"beicun/back/model"
)

type SearchService struct {
	db *gorm.DB
}

func NewSearchService(db *gorm.DB) *SearchService {
	return &SearchService{
		db: db,
	}
}

// SearchProducts 搜索产品
func (s *SearchService) SearchProducts(query string) ([]model.Product, error) {
	var products []model.Product
	err := s.db.Where("name ILIKE ? OR description ILIKE ?", "%"+query+"%", "%"+query+"%").
		Preload("Brand").
		Preload("ProductType").
		Find(&products).Error
	return products, err
}

// SearchReviews 搜索测评
func (s *SearchService) SearchReviews(query string) ([]model.Review, error) {
	var reviews []model.Review
	err := s.db.Where("title ILIKE ? OR unboxing ILIKE ? OR experience ILIKE ? OR maintenance ILIKE ? OR conclusion ILIKE ?",
		"%"+query+"%", "%"+query+"%", "%"+query+"%", "%"+query+"%", "%"+query+"%").
		Preload("Product").
		Preload("User").
		Find(&reviews).Error
	return reviews, err
}

// SearchBrands 搜索品牌
func (s *SearchService) SearchBrands(query string) ([]model.Brand, error) {
	var brands []model.Brand
	err := s.db.Where("name ILIKE ? OR description ILIKE ?", "%"+query+"%", "%"+query+"%").
		Find(&brands).Error
	return brands, err
}

// SearchUsers 搜索用户
func (s *SearchService) SearchUsers(query string) ([]model.User, error) {
	var users []model.User
	err := s.db.Where("name ILIKE ? OR email ILIKE ? OR phone ILIKE ?",
		"%"+query+"%", "%"+query+"%", "%"+query+"%").
		Find(&users).Error
	return users, err
}
