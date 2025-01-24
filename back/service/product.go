package service

import (
	"beicun/back/model"
	"beicun/back/utils"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gosimple/slug"
	"gorm.io/gorm"
)

var (
	ErrInvalidProduct  = errors.New("无效的产品信息")
	ErrProductNotFound = errors.New("产品不存在")
)

type ProductService struct {
	db *gorm.DB
}

func NewProductService(db *gorm.DB) *ProductService {
	return &ProductService{
		db: db,
	}
}

// CreateProductRequest 创建产品请求
type CreateProductRequest struct {
	Name             string           `json:"name" validate:"required"`
	RegistrationDate time.Time        `json:"registrationDate" validate:"required"`
	Price            float64          `json:"price" validate:"required,gt=0"`
	Height           float64          `json:"height" validate:"required,gt=0"`
	Width            float64          `json:"width" validate:"required,gt=0"`
	Length           float64          `json:"length" validate:"required,gt=0"`
	ChannelLength    float64          `json:"channelLength" validate:"required,gt=0"`
	TotalLength      float64          `json:"totalLength" validate:"required,gt=0"`
	Weight           float64          `json:"weight" validate:"required,gt=0"`
	Version          string           `json:"version" validate:"required"`
	IsReversible     bool             `json:"isReversible"`
	Stimulation      string           `json:"stimulation" validate:"required,oneof=LOW MEDIUM HIGH"`
	Softness         string           `json:"softness" validate:"required,oneof=ULTRA_SOFT SOFT MEDIUM HARD ULTRA_HARD"`
	Tightness        string           `json:"tightness" validate:"required,oneof=TIGHT MEDIUM LOOSE"`
	Smell            string           `json:"smell" validate:"required,oneof=HIGH MEDIUM LOW"`
	Oiliness         string           `json:"oiliness" validate:"required,oneof=HIGH MEDIUM LOW"`
	Durability       string           `json:"durability" validate:"required,oneof=HIGH MEDIUM LOW"`
	Description      *string          `json:"description"`
	TaobaoUrl        *string          `json:"taobaoUrl"`
	MainImage        []model.MainImage `json:"mainImage" validate:"required,dive"`
	SalesImage       []model.SalesImage `json:"salesImage" validate:"required,dive"`
	ProductImages    []model.ProductImage `json:"productImages" validate:"dive"`
	VideoUrl         *string          `json:"videoUrl"`
	UtilityTypeID   string           `json:"utilityTypeId" validate:"required,uuid"`
	ProductTypeID   string           `json:"productTypeId" validate:"required,uuid"`
	ChannelTypeID   string           `json:"channelTypeId" validate:"required,uuid"`
	BrandID         string           `json:"brandId" validate:"required,uuid"`
	MaterialTypeID  string           `json:"materialTypeId" validate:"required,uuid"`
}

// UpdateProductRequest 更新产品请求
type UpdateProductRequest struct {
	Name             string           `json:"name"`
	RegistrationDate time.Time        `json:"registrationDate"`
	Price            float64          `json:"price"`
	Height           float64          `json:"height"`
	Width            float64          `json:"width"`
	Length           float64          `json:"length"`
	ChannelLength    float64          `json:"channelLength"`
	TotalLength      float64          `json:"totalLength"`
	Weight           float64          `json:"weight"`
	Version          string           `json:"version"`
	IsReversible     *bool            `json:"isReversible"`
	Stimulation      string           `json:"stimulation"`
	Softness         string           `json:"softness"`
	Tightness        string           `json:"tightness"`
	Smell            string           `json:"smell"`
	Oiliness         string           `json:"oiliness"`
	Durability       string           `json:"durability"`
	Description      *string          `json:"description"`
	TaobaoUrl        *string          `json:"taobaoUrl"`
	MainImage        []model.MainImage `json:"mainImage"`
	SalesImage       []model.SalesImage `json:"salesImage"`
	ProductImages    []model.ProductImage `json:"productImages"`
	VideoUrl         *string          `json:"videoUrl"`
	UtilityTypeID   string           `json:"utilityTypeId"`
	ProductTypeID   string           `json:"productTypeId"`
	ChannelTypeID   string           `json:"channelTypeId"`
	BrandID         string           `json:"brandId"`
	MaterialTypeID  string           `json:"materialTypeId"`
}

// ProductResponse 产品响应
type ProductResponse struct {
	model.Product
	Reviews      []model.Review      `json:"reviews,omitempty"` // 添加产品测评
	Ratings      []model.Rating      `json:"-"`                 // 隐藏评分详情
	Tags         []model.ProductTag  `json:"-"`                 // 隐藏标签详情
	MainImage    []model.MainImage   `json:"mainImage"`         // 主图
	SalesImage   []model.SalesImage  `json:"salesImage"`        // 销售图
	ProductImages []model.ProductImage `json:"productImages"`    // 产品图片
}

func (s *ProductService) toProductResponse(product *model.Product) (*ProductResponse, error) {
	var mainImages []model.MainImage
	var salesImages []model.SalesImage
	var productImages []model.ProductImage

	if len(product.MainImage) > 0 {
		if err := json.Unmarshal(product.MainImage, &mainImages); err != nil {
			return nil, fmt.Errorf("解析主图数据失败: %v", err)
		}
	}
	
	if len(product.SalesImage) > 0 {
		if err := json.Unmarshal(product.SalesImage, &salesImages); err != nil {
			return nil, fmt.Errorf("解析销售图数据失败: %v", err)
		}
	}
	
	if len(product.ProductImages) > 0 {
		if err := json.Unmarshal(product.ProductImages, &productImages); err != nil {
			return nil, fmt.Errorf("解析产品图数据失败: %v", err)
		}
	}

	// 创建响应对象，复制基本字段
	response := &ProductResponse{
		Product: *product,
	}

	// 设置图片数据
	response.MainImage = mainImages
	response.SalesImage = salesImages
	response.ProductImages = productImages

	// 清除原始的 JSON 数据，避免重复
	response.Product.MainImage = nil
	response.Product.SalesImage = nil
	response.Product.ProductImages = nil

	return response, nil
}

// CreateProduct 创建产品
func (s *ProductService) CreateProduct(c *gin.Context, req *CreateProductRequest) (*ProductResponse, error) {
	// 检查关联数据是否存在
	var utilityType model.UtilityType
	if err := s.db.First(&utilityType, "id = ?", req.UtilityTypeID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("器具类型不存在")
		}
		return nil, err
	}

	var productType model.ProductType
	if err := s.db.First(&productType, "id = ?", req.ProductTypeID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("产品类型不存在")
		}
		return nil, err
	}

	var channelType model.ChannelType
	if err := s.db.First(&channelType, "id = ?", req.ChannelTypeID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("通道类型不存在")
		}
		return nil, err
	}

	var brand model.Brand
	if err := s.db.First(&brand, "id = ?", req.BrandID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("品牌不存在")
		}
		return nil, err
	}

	var materialType model.MaterialType
	if err := s.db.First(&materialType, "id = ?", req.MaterialTypeID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("材料类型不存在")
		}
		return nil, err
	}

	// 将图片数据转换为 JSONB
	mainImageJSON, err := json.Marshal(req.MainImage)
	if err != nil {
		return nil, fmt.Errorf("转换主图数据失败: %v", err)
	}

	salesImageJSON, err := json.Marshal(req.SalesImage)
	if err != nil {
		return nil, fmt.Errorf("转换销售图数据失败: %v", err)
	}

	productImagesJSON, err := json.Marshal(req.ProductImages)
	if err != nil {
		return nil, fmt.Errorf("转换产品图数据失败: %v", err)
	}

	// 创建产品
	product := model.Product{
		Name:             req.Name,
		Slug:             slug.Make(req.Name),
		RegistrationDate: req.RegistrationDate,
		BrandID:          req.BrandID,
		ProductTypeID:    req.ProductTypeID,
		ChannelTypeID:    req.ChannelTypeID,
		MaterialTypeID:   req.MaterialTypeID,
		UtilityTypeID:    req.UtilityTypeID,
		Price:            req.Price,
		Height:           req.Height,
		Width:            req.Width,
		Length:           req.Length,
		ChannelLength:    req.ChannelLength,
		TotalLength:      req.TotalLength,
		Weight:           req.Weight,
		Version:          req.Version,
		IsReversible:     req.IsReversible,
		Stimulation:      model.StimulationLevel(req.Stimulation),
		Softness:         model.SoftnessLevel(req.Softness),
		Tightness:        model.TightnessLevel(req.Tightness),
		Smell:            model.Level(req.Smell),
		Oiliness:         model.Level(req.Oiliness),
		Durability:       model.DurabilityLevel(req.Durability),
		Description:      req.Description,
		TaobaoUrl:        req.TaobaoUrl,
		MainImage:        mainImageJSON,
		SalesImage:       salesImageJSON,
		ProductImages:    productImagesJSON,
		VideoUrl:         req.VideoUrl,
		UserID:           utils.GetUserIDFromContext(c),
	}

	if err := s.db.Create(&product).Error; err != nil {
		return nil, err
	}

	return s.toProductResponse(&product)
}

// UpdateProduct 更新产品
func (s *ProductService) UpdateProduct(c *gin.Context, id string, req *UpdateProductRequest) (*ProductResponse, error) {
	var product model.Product
	if err := s.db.First(&product, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrProductNotFound
		}
		return nil, err
	}

	// 更新基本信息
	if req.Name != "" {
		product.Name = req.Name
		product.Slug = slug.Make(req.Name)
	}
	if !req.RegistrationDate.IsZero() {
		product.RegistrationDate = req.RegistrationDate
	}
	if req.Price > 0 {
		product.Price = req.Price
	}
	if req.Height > 0 {
		product.Height = req.Height
	}
	if req.Width > 0 {
		product.Width = req.Width
	}
	if req.Length > 0 {
		product.Length = req.Length
	}
	if req.ChannelLength > 0 {
		product.ChannelLength = req.ChannelLength
	}
	if req.TotalLength > 0 {
		product.TotalLength = req.TotalLength
	}
	if req.Weight > 0 {
		product.Weight = req.Weight
	}
	if req.Version != "" {
		product.Version = req.Version
	}
	if req.IsReversible != nil {
		product.IsReversible = *req.IsReversible
	}
	if req.Stimulation != "" {
		product.Stimulation = model.StimulationLevel(req.Stimulation)
	}
	if req.Softness != "" {
		product.Softness = model.SoftnessLevel(req.Softness)
	}
	if req.Tightness != "" {
		product.Tightness = model.TightnessLevel(req.Tightness)
	}
	if req.Smell != "" {
		product.Smell = model.Level(req.Smell)
	}
	if req.Oiliness != "" {
		product.Oiliness = model.Level(req.Oiliness)
	}
	if req.Durability != "" {
		product.Durability = model.DurabilityLevel(req.Durability)
	}
	if req.Description != nil {
		product.Description = req.Description
	}
	if req.TaobaoUrl != nil {
		product.TaobaoUrl = req.TaobaoUrl
	}
	if len(req.MainImage) > 0 {
		mainImageJSON, err := json.Marshal(req.MainImage)
		if err != nil {
			return nil, fmt.Errorf("转换主图数据失败: %v", err)
		}
		product.MainImage = mainImageJSON
	}
	if len(req.SalesImage) > 0 {
		salesImageJSON, err := json.Marshal(req.SalesImage)
		if err != nil {
			return nil, fmt.Errorf("转换销售图数据失败: %v", err)
		}
		product.SalesImage = salesImageJSON
	}
	if len(req.ProductImages) > 0 {
		productImagesJSON, err := json.Marshal(req.ProductImages)
		if err != nil {
			return nil, fmt.Errorf("转换产品图数据失败: %v", err)
		}
		product.ProductImages = productImagesJSON
	}
	if req.VideoUrl != nil {
		product.VideoUrl = req.VideoUrl
	}

	// 更新关联ID
	if req.UtilityTypeID != "" {
		var utilityType model.UtilityType
		if err := s.db.First(&utilityType, "id = ?", req.UtilityTypeID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errors.New("器具类型不存在")
			}
			return nil, err
		}
		product.UtilityTypeID = req.UtilityTypeID
	}

	if req.ProductTypeID != "" {
		var productType model.ProductType
		if err := s.db.First(&productType, "id = ?", req.ProductTypeID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errors.New("产品类型不存在")
			}
			return nil, err
		}
		product.ProductTypeID = req.ProductTypeID
	}

	if req.ChannelTypeID != "" {
		var channelType model.ChannelType
		if err := s.db.First(&channelType, "id = ?", req.ChannelTypeID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errors.New("通道类型不存在")
			}
			return nil, err
		}
		product.ChannelTypeID = req.ChannelTypeID
	}

	if req.BrandID != "" {
		var brand model.Brand
		if err := s.db.First(&brand, "id = ?", req.BrandID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errors.New("品牌不存在")
			}
			return nil, err
		}
		product.BrandID = req.BrandID
	}

	if req.MaterialTypeID != "" {
		var materialType model.MaterialType
		if err := s.db.First(&materialType, "id = ?", req.MaterialTypeID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, errors.New("材料类型不存在")
			}
			return nil, err
		}
		product.MaterialTypeID = req.MaterialTypeID
	}

	if err := s.db.Save(&product).Error; err != nil {
		return nil, err
	}

	return s.toProductResponse(&product)
}

// DeleteProduct 删除产品
func (s *ProductService) DeleteProduct(c *gin.Context, id string) error {
	result := s.db.Delete(&model.Product{}, "id = ?", id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrProductNotFound
	}
	return nil
}

// GetProduct 获取产品详情
func (s *ProductService) GetProduct(c *gin.Context, id uint ) (*ProductResponse, error) {
	var product model.Product
	if err := s.db.Preload("UtilityType").
		Preload("ProductType").
		Preload("ChannelType").
		Preload("Brand").
		Preload("MaterialType").
		First(&product, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrProductNotFound
		}
		return nil, err
	}

	return s.toProductResponse(&product)
}

// GetProductBySlug 通过 slug 获取产品详情
func (s *ProductService) GetProductBySlug(c *gin.Context, slug string) (*ProductResponse, error) {
	var product model.Product
	if err := s.db.Preload("UtilityType").
		Preload("ProductType").
		Preload("ChannelType").
		Preload("Brand").
		Preload("MaterialType").
		First(&product, "slug = ?", slug).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrProductNotFound
		}
		return nil, err
	}

	// 增加浏览量
	if err := s.db.Model(&product).UpdateColumn("view_count", gorm.Expr("view_count + ?", 1)).Error; err != nil {
		return nil, err
	}

	return s.toProductResponse(&product)
}


// ListProducts 获取产品列表
func (s *ProductService) ListProducts(c *gin.Context, page, pageSize int, filters map[string]interface{}) ([]*ProductResponse, int64, error) {
	var products []model.Product
	var total int64

	query := s.db.Model(&model.Product{})

	// 应用过滤条件
	if brandID, ok := filters["brandId"].(string); ok {
		query = query.Where("brand_id = ?", brandID)
	}
	if utilityTypeID, ok := filters["utilityTypeId"].(string); ok {
		query = query.Where("utility_type_id = ?", utilityTypeID)
	}
	if productTypeID, ok := filters["productTypeId"].(string); ok {
		query = query.Where("product_type_id = ?", productTypeID)
	}
	if channelTypeID, ok := filters["channelTypeId"].(string); ok {
		query = query.Where("channel_type_id = ?", channelTypeID)
	}
	if materialTypeID, ok := filters["materialTypeId"].(string); ok {
		query = query.Where("material_type_id = ?", materialTypeID)
	}
	if minPrice, ok := filters["minPrice"].(float64); ok {
		query = query.Where("price >= ?", minPrice)
	}
	if maxPrice, ok := filters["maxPrice"].(float64); ok {
		query = query.Where("price <= ?", maxPrice)
	}
	if search, ok := filters["search"].(string); ok && search != "" {
		query = query.Where("name LIKE ? OR description LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	// 获取总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 获取分页数据
	if err := query.Preload("UtilityType").
		Preload("ProductType").
		Preload("ChannelType").
		Preload("Brand").
		Preload("MaterialType").
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Find(&products).Error; err != nil {
		return nil, 0, err
	}

	// 转换为响应格式
	var responses []*ProductResponse
	for _, product := range products {
		response, err := s.toProductResponse(&product)
		if err != nil {
			return nil, 0, err
		}
		responses = append(responses, response)
	}

	return responses, total, nil
}
