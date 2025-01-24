package handler

import (
	"beicun/back/service"
	"beicun/back/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ProductHandler struct {
	productService *service.ProductService
}

func NewProductHandler(productService *service.ProductService) *ProductHandler {
	return &ProductHandler{
		productService: productService,
	}
}

// CreateProduct 创建产品
// @Summary 创建新产品
// @Description 创建一个新的产品
// @Tags 产品管理
// @Accept json
// @Produce json
// @Param request body service.CreateProductRequest true "产品信息"
// @Success 200 {object} utils.Response{data=service.ProductResponse}
// @Failure 400 {object} utils.Response
// @Security BearerAuth
// @Router /products [post]
func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var req service.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, "无效的请求参数")
		return
	}

	product, err := h.productService.CreateProduct(c, &req)
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	utils.SuccessWithMessage(c, "创建产品成功", product)
}

// UpdateProduct 更新产品
// @Summary 更新产品信息
// @Description 更新指定产品的信息
// @Tags 产品管理
// @Accept json
// @Produce json
// @Param id path int true "产品ID"
// @Param request body service.UpdateProductRequest true "产品更新信息"
// @Success 200 {object} utils.Response{data=service.ProductResponse}
// @Failure 400,404 {object} utils.Response
// @Security BearerAuth
// @Router /products/{id} [put]
func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ParamError(c, "无效的产品ID")
		return
	}

	var req service.UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, "无效的请求参数")
		return
	}

	product, err := h.productService.UpdateProduct(c, strconv.FormatUint(uint64(id), 10), &req)
	if err != nil {
		if err == service.ErrProductNotFound {
			utils.NotFoundError(c, "产品不存在")
			return
		}
		utils.InternalError(c, err)
		return
	}

	utils.SuccessWithMessage(c, "更新产品成功", product)
}

// DeleteProduct 删除产品
// @Summary 删除产品
// @Description 删除指定的产品
// @Tags 产品管理
// @Produce json
// @Param id path int true "产品ID"
// @Success 200 {object} utils.Response
// @Failure 400,404 {object} utils.Response
// @Security BearerAuth
// @Router /products/{id} [delete]
func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ParamError(c, "无效的产品ID")
		return
	}

	if err := h.productService.DeleteProduct(c, strconv.FormatUint(uint64(id), 10)); err != nil {
		if err == service.ErrProductNotFound {
			utils.NotFoundError(c, "产品不存在")
			return
		}
		utils.InternalError(c, err)
		return
	}

	utils.SuccessWithMessage(c, "删除产品成功", nil)
}

// GetProduct 获取产品详情
// @Summary 获取产品详情
// @Description 获取指定产品的详细信息
// @Tags 产品管理
// @Produce json
// @Param id path int true "产品ID"
// @Success 200 {object} utils.Response{data=service.ProductResponse}
// @Failure 400,404 {object} utils.Response
// @Router /products/{id} [get]
func (h *ProductHandler) GetProduct(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ParamError(c, "无效的产品ID")
		return
	}

	product, err := h.productService.GetProduct(c, uint(id))
	if err != nil {
		if err == service.ErrProductNotFound {
			utils.NotFoundError(c, "产品不存在")
			return
		}
		utils.InternalError(c, err)
		return
	}

	utils.Success(c, product)
}

// GetProductBySlug 获取产品详情 Slug
// @Summary 获取产品详情
// @Description 获取指定产品的详细信息
// @Tags 产品管理
// @Produce json
// @Param slug path string true "产品Slug"
// @Success 200 {object} utils.Response{data=service.ProductResponse}
// @Failure 400,404 {object} utils.Response
// @Router /products/slug/{slug} [get]
func (h *ProductHandler) GetProductBySlug(c *gin.Context) {
	slug := c.Param("slug")
	product, err := h.productService.GetProductBySlug(c, slug)
	if err != nil {
		if err == service.ErrProductNotFound {
			utils.NotFoundError(c, "产品不存在")
			return
		}
		utils.InternalError(c, err)
		return
	}

	utils.Success(c, product)
}


// ListProducts 获取产品列表
// @Summary 获取产品列表
// @Description 获取产品列表，支持分页和过滤
// @Tags 产品管理
// @Produce json
// @Param page query int false "页码" default(1)
// @Param pageSize query int false "每页数量" default(10)
// @Param brandId query int false "品牌ID"
// @Param typeId query int false "类型ID"
// @Param status query string false "状态"
// @Param minPrice query number false "最低价格"
// @Param maxPrice query number false "最高价格"
// @Param search query string false "搜索关键词"
// @Success 200 {object} utils.Response{data=utils.PageData{list=[]service.ProductResponse}}
// @Failure 400 {object} utils.Response
// @Router /products [get]
func (h *ProductHandler) ListProducts(c *gin.Context) {
	// 获取分页参数
	page, pageSize := utils.GetPageInfo(c)

	// 获取过滤参数
	filters := make(map[string]interface{})
	
	if brandID, err := strconv.ParseUint(c.Query("brandId"), 10, 32); err == nil {
		filters["brandId"] = uint(brandID)
	}
	if typeID, err := strconv.ParseUint(c.Query("typeId"), 10, 32); err == nil {
		filters["typeId"] = uint(typeID)
	}
	if status := c.Query("status"); status != "" {
		filters["status"] = status
	}
	if minPrice, err := strconv.ParseFloat(c.Query("minPrice"), 64); err == nil {
		filters["minPrice"] = minPrice
	}
	if maxPrice, err := strconv.ParseFloat(c.Query("maxPrice"), 64); err == nil {
		filters["maxPrice"] = maxPrice
	}
	if search := c.Query("search"); search != "" {
		filters["search"] = search
	}

	// 获取产品列表
	products, total, err := h.productService.ListProducts(c, page, pageSize, filters)
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	utils.PageSuccess(c, products, total, page, pageSize)
}
