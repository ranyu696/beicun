package service

import (
	"beicun/back/model"
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/gosimple/slug"
	"gorm.io/gorm"
)

var (
	ErrBrandNotFound = errors.New("品牌不存在")
	ErrBrandExists   = errors.New("品牌已存在")
)

type CreateBrandRequest struct {
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description"`
	Website     *string `json:"website,omitempty"`
	Logo        string  `json:"logo,omitempty"`
	SortOrder   int     `json:"sortOrder"`
}

type UpdateBrandRequest struct {
	Name        string  `json:"name,omitempty"`
	Description string  `json:"description,omitempty"`
	Website     *string `json:"website,omitempty"`
	Logo        string  `json:"logo,omitempty"`
	SortOrder   *int    `json:"sortOrder,omitempty"`
}

type BrandQueryParams struct {
	Keyword   string `form:"keyword"`
	SortBy    string `form:"sortBy"`    // updatedAt
	SortOrder string `form:"sortOrder"` // asc/desc
	Page      int    `form:"page"`
	PageSize  int    `form:"pageSize"`
}

type BrandService struct {
	db *gorm.DB
}

func NewBrandService(db *gorm.DB) *BrandService {
	return &BrandService{db: db}
}

// generateUniqueSlug 生成唯一的品牌 slug
func (s *BrandService) generateUniqueSlug(name string) (string, error) {
	baseSlug := slug.Make(name)
	finalSlug := baseSlug
	counter := 1

	for {
		var count int64
		if err := s.db.Model(&model.Brand{}).Where("slug = ?", finalSlug).Count(&count).Error; err != nil {
			return "", err
		}
		if count == 0 {
			break
		}
		finalSlug = slug.Make(baseSlug + "-" + string(counter))
		counter++
	}

	return finalSlug, nil
}

// CreateBrand 创建品牌
func (s *BrandService) CreateBrand(c *gin.Context, req *CreateBrandRequest) (*model.Brand, error) {
	var count int64
	if err := s.db.Model(&model.Brand{}).Where("name = ?", req.Name).Count(&count).Error; err != nil {
		return nil, err
	}
	if count > 0 {
		return nil, ErrBrandExists
	}

	// 生成唯一的 slug
	slug, err := s.generateUniqueSlug(req.Name)
	if err != nil {
		return nil, err
	}

	brand := &model.Brand{
		Name:        req.Name,
		Slug:        slug,
		Description: req.Description,
		Logo:        req.Logo,
		Website:     req.Website,
		SortOrder:   req.SortOrder,
	}

	if err := s.db.Create(brand).Error; err != nil {
		return nil, err
	}

	return brand, nil
}

// UpdateBrand 更新品牌
func (s *BrandService) UpdateBrand(c *gin.Context, id string, req *UpdateBrandRequest) (*model.Brand, error) {
	brand, err := s.GetBrand(c, id)
	if err != nil {
		return nil, err
	}

	if req.Name != "" && req.Name != brand.Name {
		var count int64
		if err := s.db.Model(&model.Brand{}).Where("name = ? AND id != ?", req.Name, id).Count(&count).Error; err != nil {
			return nil, err
		}
		if count > 0 {
			return nil, ErrBrandExists
		}
		brand.Name = req.Name

		// 更新 slug
		slug, err := s.generateUniqueSlug(req.Name)
		if err != nil {
			return nil, err
		}
		brand.Slug = slug
	}

	if req.Description != "" {
		brand.Description = req.Description
	}
	if req.Website != nil {
		brand.Website = req.Website
	}
	if req.Logo != "" {
		brand.Logo = req.Logo
	}
	if req.SortOrder != nil {
		brand.SortOrder = *req.SortOrder
	}

	if err := s.db.Save(brand).Error; err != nil {
		return nil, err
	}

	return brand, nil
}

// DeleteBrand 删除品牌
func (s *BrandService) DeleteBrand(c *gin.Context, id string) error {
	result := s.db.Delete(&model.Brand{}, "id = ?", id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrBrandNotFound
	}
	return nil
}

// GetBrand 获取品牌详情
func (s *BrandService) GetBrand(c *gin.Context, id string) (*model.Brand, error) {
	var brand model.Brand
	if err := s.db.Where("id = ?", id).First(&brand).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrBrandNotFound
		}
		return nil, err
	}

	return &brand, nil
}

// GetBrandBySlug 通过 slug 获取品牌详情
func (s *BrandService) GetBrandBySlug(c *gin.Context, slug string) (*model.Brand, error) {
	var brand model.Brand
	if err := s.db.Where("slug = ?", slug).First(&brand).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrBrandNotFound
		}
		return nil, err
	}

	return &brand, nil
}

// GetBrandProducts 获取品牌产品列表
func (s *BrandService) GetBrandProducts(c *gin.Context, slug string, page, pageSize int) ([]*model.Product, int64, error) {
	// 先获取品牌
	brand, err := s.GetBrandBySlug(c, slug)
	if err != nil {
		return nil, 0, err
	}

	var total int64
	query := s.db.Model(&model.Product{}).Where("brand_id = ?", brand.ID)

	// 计算总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 获取产品列表
	var products []*model.Product
	if err := query.Offset((page - 1) * pageSize).
		Limit(pageSize).
		Order("created_at DESC").
		Find(&products).Error; err != nil {
		return nil, 0, err
	}

	return products, total, nil
}

// ListBrands 获取品牌列表
func (s *BrandService) ListBrands(c *gin.Context, params *BrandQueryParams) ([]*model.Brand, int64, error) {
	var total int64
	query := s.db.Model(&model.Brand{})

	// 添加搜索条件
	if params.Keyword != "" {
		query = query.Where("name LIKE ? OR description LIKE ?", 
			"%"+params.Keyword+"%", "%"+params.Keyword+"%")
	}

	// 计算总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 添加排序
	if params.SortBy == "updatedAt" {
		if params.SortOrder == "asc" {
			query = query.Order("updated_at ASC")
		} else {
			query = query.Order("updated_at DESC")
		}
	} else {
		// 默认按照排序值升序，创建时间降序
		query = query.Order("sort_order ASC, created_at DESC")
	}

	// 分页
	var brands []*model.Brand
	if err := query.Offset((params.Page - 1) * params.PageSize).
		Limit(params.PageSize).
		Find(&brands).Error; err != nil {
		return nil, 0, err
	}

	return brands, total, nil
}
