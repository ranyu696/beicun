package handler

import (
	"github.com/gin-gonic/gin"

	"beicun/back/service"
	"beicun/back/utils"
)

type SearchHandler struct {
	searchService *service.SearchService
}

func NewSearchHandler(searchService *service.SearchService) *SearchHandler {
	return &SearchHandler{
		searchService: searchService,
	}
}

// RegisterRoutes 注册路由
func (h *SearchHandler) RegisterRoutes(r *gin.Engine) {
	search := r.Group("/api/search")
	{
		search.GET("/products", h.SearchProducts)
		search.GET("/reviews", h.SearchReviews)
		search.GET("/brands", h.SearchBrands)
		search.GET("/users", h.SearchUsers)
	}
}

// @Summary 搜索产品
// @Description 根据关键词搜索产品
// @Tags 搜索
// @Accept json
// @Produce json
// @Param q query string true "搜索关键词"
// @Success 200 {array} model.Product
// @Failure 400 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/search/products [get]
func (h *SearchHandler) SearchProducts(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		utils.ParamError(c, "搜索关键词不能为空")
		return
	}

	products, err := h.searchService.SearchProducts(query)
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	utils.Success(c, products)
}

// @Summary 搜索测评
// @Description 根据关键词搜索测评
// @Tags 搜索
// @Accept json
// @Produce json
// @Param q query string true "搜索关键词"
// @Success 200 {array} model.Review
// @Failure 400 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/search/reviews [get]
func (h *SearchHandler) SearchReviews(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		utils.ParamError(c, "搜索关键词不能为空")
		return
	}

	reviews, err := h.searchService.SearchReviews(query)
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	utils.Success(c, reviews)
}

// @Summary 搜索品牌
// @Description 根据关键词搜索品牌
// @Tags 搜索
// @Accept json
// @Produce json
// @Param q query string true "搜索关键词"
// @Success 200 {array} model.Brand
// @Failure 400 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/search/brands [get]
func (h *SearchHandler) SearchBrands(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		utils.ParamError(c, "搜索关键词不能为空")
		return
	}

	brands, err := h.searchService.SearchBrands(query)
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	utils.Success(c, brands)
}

// @Summary 搜索用户
// @Description 根据关键词搜索用户（仅管理员）
// @Tags 搜索
// @Accept json
// @Produce json
// @Param q query string true "搜索关键词"
// @Success 200 {array} model.User
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 403 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/search/users [get]
func (h *SearchHandler) SearchUsers(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		utils.ParamError(c, "搜索关键词不能为空")
		return
	}

	users, err := h.searchService.SearchUsers(query)
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	utils.Success(c, users)
}
