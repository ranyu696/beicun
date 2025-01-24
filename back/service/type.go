package service

import (
	"beicun/back/model"
	"errors"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var (
	ErrTypeNotFound = errors.New("类型不存在")
	ErrTypeExists   = errors.New("类型已存在")
	ErrInvalidType  = errors.New("无效的类型信息")
)

type CreateTypeRequest struct {
	Name        string `json:"name" binding:"required,min=1,max=50"`
	Description string `json:"description" binding:"max=1000"`
	SortOrder   int    `json:"sortOrder"`
}

type UpdateTypeRequest struct {
	Name        string `json:"name" binding:"omitempty,min=1,max=50"`
	Description string `json:"description" binding:"max=1000"`
	SortOrder   int    `json:"sortOrder"`
}

type TypeResponse struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	SortOrder   int    `json:"sortOrder"`
	CreatedAt   string `json:"createdAt"`
	UpdatedAt   string `json:"updatedAt"`
}

// TypeService 通用类型服务
type TypeService struct {
	db        *gorm.DB
	modelType interface{}
	tableName string
}

// NewUtilityTypeService 创建器具类型服务
func NewUtilityTypeService(db *gorm.DB) *TypeService {
	return &TypeService{
		db:        db,
		modelType: &model.UtilityType{},
		tableName: "utility_types",
	}
}

// NewProductTypeService 创建产品类型服务
func NewProductTypeService(db *gorm.DB) *TypeService {
	return &TypeService{
		db:        db,
		modelType: &model.ProductType{},
		tableName: "product_types",
	}
}

// NewChannelTypeService 创建通道类型服务
func NewChannelTypeService(db *gorm.DB) *TypeService {
	return &TypeService{
		db:        db,
		modelType: &model.ChannelType{},
		tableName: "channel_types",
	}
}

// NewMaterialTypeService 创建材料类型服务
func NewMaterialTypeService(db *gorm.DB) *TypeService {
	return &TypeService{
		db:        db,
		modelType: &model.MaterialType{},
		tableName: "material_types",
	}
}

// CreateType 创建类型
func (s *TypeService) CreateType(c *gin.Context, req *CreateTypeRequest) (*TypeResponse, error) {
	// 检查名称是否已存在
	var count int64
	if err := s.db.Table(s.tableName).Where("name = ?", req.Name).Count(&count).Error; err != nil {
		return nil, err
	}
	if count > 0 {
		return nil, ErrTypeExists
	}

	// 创建新类型
	var newType interface{}
	switch s.modelType.(type) {
	case *model.UtilityType:
		newType = &model.UtilityType{
			Name:        req.Name,
			Description: req.Description,
			SortOrder:   req.SortOrder,
		}
	case *model.ProductType:
		newType = &model.ProductType{
			Name:        req.Name,
			Description: req.Description,
			SortOrder:   req.SortOrder,
		}
	case *model.ChannelType:
		newType = &model.ChannelType{
			Name:        req.Name,
			Description: req.Description,
			SortOrder:   req.SortOrder,
		}
	case *model.MaterialType:
		newType = &model.MaterialType{
			Name:        req.Name,
			Description: req.Description,
			SortOrder:   req.SortOrder,
		}
	default:
		return nil, ErrInvalidType
	}

	if err := s.db.Create(newType).Error; err != nil {
		return nil, err
	}
	return s.getTypeResponse(newType)
}

// UpdateType 更新类型
func (s *TypeService) UpdateType(c *gin.Context, id string, req *UpdateTypeRequest) (*TypeResponse, error) {
	// 检查是否存在
	item := s.modelType
	if err := s.db.Table(s.tableName).First(item, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTypeNotFound
		}
		return nil, err
	}

	// 如果更新名称，检查是否与其他记录重复
	if req.Name != "" {
		var count int64
		if err := s.db.Table(s.tableName).Where("name = ? AND id != ?", req.Name, id).Count(&count).Error; err != nil {
			return nil, err
		}
		if count > 0 {
			return nil, ErrTypeExists
		}
	}

	// 更新字段
	updates := make(map[string]interface{})
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	updates["sort_order"] = req.SortOrder

	if err := s.db.Table(s.tableName).Where("id = ?", id).Updates(updates).Error; err != nil {
		return nil, err
	}

	// 重新获取更新后的记录
	if err := s.db.Table(s.tableName).First(item, "id = ?", id).Error; err != nil {
		return nil, err
	}

	return s.getTypeResponse(item)
}

// DeleteType 删除类型
func (s *TypeService) DeleteType(c *gin.Context, id string) error {
	// 检查是否有关联的产品
	var count int64
	if err := s.db.Table("products").Where(s.getForeignKeyCondition()+" = ?", id).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return errors.New("该类型下有关联的产品，无法删除")
	}

	result := s.db.Table(s.tableName).Delete(s.modelType, "id = ?", id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrTypeNotFound
	}
	return nil
}

// GetType 获取类型详情
func (s *TypeService) GetType(c *gin.Context, id string) (*TypeResponse, error) {
	item := s.modelType
	if err := s.db.Table(s.tableName).First(item, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrTypeNotFound
		}
		return nil, err
	}
	return s.getTypeResponse(item)
}

// ListTypes 获取类型列表
func (s *TypeService) ListTypes(c *gin.Context, page, pageSize int) ([]*TypeResponse, int64, error) {
	var total int64
	if err := s.db.Table(s.tableName).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	items := make([]interface{}, 0)
	switch s.modelType.(type) {
	case *model.UtilityType:
		var typeItems []*model.UtilityType
		if err := s.db.Table(s.tableName).
			Order("sort_order ASC, created_at DESC").
			Offset((page - 1) * pageSize).
			Limit(pageSize).
			Find(&typeItems).Error; err != nil {
			return nil, 0, err
		}
		for _, item := range typeItems {
			items = append(items, item)
		}
	case *model.ProductType:
		var typeItems []*model.ProductType
		if err := s.db.Table(s.tableName).
			Order("sort_order ASC, created_at DESC").
			Offset((page - 1) * pageSize).
			Limit(pageSize).
			Find(&typeItems).Error; err != nil {
			return nil, 0, err
		}
		for _, item := range typeItems {
			items = append(items, item)
		}
	case *model.ChannelType:
		var typeItems []*model.ChannelType
		if err := s.db.Table(s.tableName).
			Order("sort_order ASC, created_at DESC").
			Offset((page - 1) * pageSize).
			Limit(pageSize).
			Find(&typeItems).Error; err != nil {
			return nil, 0, err
		}
		for _, item := range typeItems {
			items = append(items, item)
		}
	case *model.MaterialType:
		var typeItems []*model.MaterialType
		if err := s.db.Table(s.tableName).
			Order("sort_order ASC, created_at DESC").
			Offset((page - 1) * pageSize).
			Limit(pageSize).
			Find(&typeItems).Error; err != nil {
			return nil, 0, err
		}
		for _, item := range typeItems {
			items = append(items, item)
		}
	}

	responses := make([]*TypeResponse, len(items))
	for i, item := range items {
		response, err := s.getTypeResponse(item)
		if err != nil {
			return nil, 0, err
		}
		responses[i] = response
	}

	return responses, total, nil
}

// getTypeResponse 转换为响应结构
func (s *TypeService) getTypeResponse(item interface{}) (*TypeResponse, error) {
	switch t := item.(type) {
	case *model.UtilityType:
		return &TypeResponse{
			ID:          t.ID,
			Name:        t.Name,
			Description: t.Description,
			SortOrder:   t.SortOrder,
			CreatedAt:   t.CreatedAt.Format("2006-01-02 15:04:05"),
			UpdatedAt:   t.UpdatedAt.Format("2006-01-02 15:04:05"),
		}, nil
	case *model.ProductType:
		return &TypeResponse{
			ID:          t.ID,
			Name:        t.Name,
			Description: t.Description,
			SortOrder:   t.SortOrder,
			CreatedAt:   t.CreatedAt.Format("2006-01-02 15:04:05"),
			UpdatedAt:   t.UpdatedAt.Format("2006-01-02 15:04:05"),
		}, nil
	case *model.ChannelType:
		return &TypeResponse{
			ID:          t.ID,
			Name:        t.Name,
			Description: t.Description,
			SortOrder:   t.SortOrder,
			CreatedAt:   t.CreatedAt.Format("2006-01-02 15:04:05"),
			UpdatedAt:   t.UpdatedAt.Format("2006-01-02 15:04:05"),
		}, nil
	case *model.MaterialType:
		return &TypeResponse{
			ID:          t.ID,
			Name:        t.Name,
			Description: t.Description,
			SortOrder:   t.SortOrder,
			CreatedAt:   t.CreatedAt.Format("2006-01-02 15:04:05"),
			UpdatedAt:   t.UpdatedAt.Format("2006-01-02 15:04:05"),
		}, nil
	default:
		return nil, ErrInvalidType
	}
}

// getForeignKeyCondition 获取外键条件
func (s *TypeService) getForeignKeyCondition() string {
	switch s.modelType.(type) {
	case *model.UtilityType:
		return "utility_type_id"
	case *model.ProductType:
		return "product_type_id"
	case *model.ChannelType:
		return "channel_type_id"
	case *model.MaterialType:
		return "material_type_id"
	default:
		return ""
	}
}
