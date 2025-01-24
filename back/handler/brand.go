package handler

import (
	"beicun/back/service"
	"beicun/back/utils"

	"github.com/gin-gonic/gin"
)

type BrandHandler struct {
	brandService *service.BrandService
}

func NewBrandHandler(brandService *service.BrandService) *BrandHandler {
	return &BrandHandler{
		brandService: brandService,
	}
}

// RegisterRoutes 注册路由
func (h *BrandHandler) RegisterRoutes(r *gin.RouterGroup) {
	brands := r.Group("/brands")
	{
		brands.GET("", h.ListBrands)
		brands.POST("", h.CreateBrand)
		brands.GET("/:id", h.GetBrand)
		brands.PUT("/:id", h.UpdateBrand)
		brands.DELETE("/:id", h.DeleteBrand)
		
		// 新增路由
		brands.GET("/slug/:slug", h.GetBrandBySlug)
		brands.GET("/slug/:slug/products", h.GetBrandProducts)
	}
}

// CreateBrand 创建品牌
// @Summary 创建新品牌
// @Description 创建一个新的品牌
// @Tags 品牌管理
// @Accept json
// @Produce json
// @Param request body service.CreateBrandRequest true "品牌信息"
// @Success 200 {object} utils.Response{data=service.BrandResponse}
// @Failure 400,409 {object} utils.Response
// @Security BearerAuth
// @Router /brands [post]
func (h *BrandHandler) CreateBrand(c *gin.Context) {
	var req service.CreateBrandRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, "无效的请求参数")
		return
	}

	brand, err := h.brandService.CreateBrand(c, &req)
	if err != nil {
		if err == service.ErrBrandExists {
			utils.ConflictError(c, err.Error())
			return
		}
		utils.InternalError(c, err)
		return
	}

	utils.SuccessWithMessage(c, "创建品牌成功", brand)
}

// UpdateBrand 更新品牌
// @Summary 更新品牌信息
// @Description 更新指定品牌的信息
// @Tags 品牌管理
// @Accept json
// @Produce json
// @Param id path string true "品牌ID"
// @Param request body service.UpdateBrandRequest true "品牌更新信息"
// @Success 200 {object} utils.Response{data=service.BrandResponse}
// @Failure 400,404,409 {object} utils.Response
// @Security BearerAuth
// @Router /brands/{id} [put]
func (h *BrandHandler) UpdateBrand(c *gin.Context) {
	id := c.Param("id")

	var req service.UpdateBrandRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, "无效的请求参数")
		return
	}

	brand, err := h.brandService.UpdateBrand(c, id, &req)
	if err != nil {
		switch err {
		case service.ErrBrandNotFound:
			utils.NotFoundError(c, err.Error())
		case service.ErrBrandExists:
			utils.ConflictError(c, err.Error())
		default:
			utils.InternalError(c, err)
		}
		return
	}

	utils.SuccessWithMessage(c, "更新品牌成功", brand)
}

// DeleteBrand 删除品牌
// @Summary 删除品牌
// @Description 删除指定的品牌
// @Tags 品牌管理
// @Produce json
// @Param id path string true "品牌ID"
// @Success 200 {object} utils.Response
// @Failure 400,404 {object} utils.Response
// @Security BearerAuth
// @Router /brands/{id} [delete]
func (h *BrandHandler) DeleteBrand(c *gin.Context) {
	id := c.Param("id")

	if err := h.brandService.DeleteBrand(c, id); err != nil {
		if err == service.ErrBrandNotFound {
			utils.NotFoundError(c, err.Error())
			return
		}
		utils.InternalError(c, err)
		return
	}

	utils.SuccessWithMessage(c, "删除品牌成功", nil)
}

// GetBrand 获取品牌详情
// @Summary 获取品牌详情
// @Description 获取指定品牌的详细信息
// @Tags 品牌管理
// @Produce json
// @Param id path string true "品牌ID"
// @Success 200 {object} utils.Response{data=service.BrandResponse}
// @Failure 400,404 {object} utils.Response
// @Router /brands/{id} [get]
func (h *BrandHandler) GetBrand(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		utils.ParamError(c, "品牌ID不能为空")
		return
	}

	brand, err := h.brandService.GetBrand(c, id)
	if err != nil {
		if err == service.ErrBrandNotFound {
			utils.NotFoundError(c, err.Error())
			return
		}
		utils.InternalError(c, err)
		return
	}

	utils.Success(c, brand)
}

// ListBrands 获取品牌列表
// @Summary 获取品牌列表
// @Description 获取品牌列表，支持分页、搜索和排序
// @Tags 品牌管理
// @Produce json
// @Param keyword query string false "搜索关键词"
// @Param sortBy query string false "排序字段(updatedAt)" Enums(updatedAt)
// @Param sortOrder query string false "排序方式" Enums(asc,desc)
// @Param page query int false "页码" default(1)
// @Param pageSize query int false "每页数量" default(10)
// @Success 200 {object} utils.Response{data=[]model.Brand}
// @Router /brands [get]
func (h *BrandHandler) ListBrands(c *gin.Context) {
	var params service.BrandQueryParams
	if err := c.ShouldBindQuery(&params); err != nil {
		utils.ParamError(c, "无效的查询参数")
		return
	}

	// 设置默认值
	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 {
		params.PageSize = 10
	}

	brands, total, err := h.brandService.ListBrands(c, &params)
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	utils.PageSuccess(c, brands, total, params.Page, params.PageSize)
}

// GetBrandBySlug 通过 slug 获取品牌详情
// @Summary 通过 slug 获取品牌详情
// @Description 通过品牌的 slug 获取品牌的详细信息
// @Tags 品牌管理
// @Produce json
// @Param slug path string true "品牌 slug"
// @Success 200 {object} utils.Response{data=model.Brand}
// @Failure 404 {object} utils.Response "品牌不存在"
// @Router /brands/slug/{slug} [get]
func (h *BrandHandler) GetBrandBySlug(c *gin.Context) {
	slug := c.Param("slug")
	brand, err := h.brandService.GetBrandBySlug(c, slug)
	if err != nil {
		if err == service.ErrBrandNotFound {
			utils.NotFoundError(c, err.Error())
			return
		}
		utils.InternalError(c, err)
		return
	}

	utils.Success(c, brand)
}

// GetBrandProducts 获取品牌产品列表
// @Summary 获取品牌产品列表
// @Description 通过品牌的 slug 获取该品牌的产品列表，支持分页
// @Tags 品牌管理
// @Produce json
// @Param slug path string true "品牌 slug"
// @Param page query int false "页码" default(1) minimum(1)
// @Param pageSize query int false "每页数量" default(10) minimum(1)
// @Success 200 {object} utils.Response{data=utils.PageData{list=[]model.Product}}
// @Failure 404 {object} utils.Response "品牌不存在"
// @Router /brands/slug/{slug}/products [get]
func (h *BrandHandler) GetBrandProducts(c *gin.Context) {
	slug := c.Param("slug")
	page, pageSize := utils.GetPageInfo(c)

	products, total, err := h.brandService.GetBrandProducts(c, slug, page, pageSize)
	if err != nil {
		if err == service.ErrBrandNotFound {
			utils.NotFoundError(c, err.Error())
			return
		}
		utils.InternalError(c, err)
		return
	}

	utils.PageSuccess(c, products, total, page, pageSize)
}
