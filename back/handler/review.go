package handler

import (
	"beicun/back/service"
	"beicun/back/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ReviewHandler struct {
	reviewService *service.ReviewService
}

func NewReviewHandler(reviewService *service.ReviewService) *ReviewHandler {
	return &ReviewHandler{
		reviewService: reviewService,
	}
}

// CreateReview 创建测评
// @Summary 创建新测评
// @Description 创建一个新的测评
// @Tags 测评管理
// @Accept json
// @Produce json
// @Param request body service.CreateReviewRequest true "测评信息"
// @Success 200 {object} utils.Response{data=service.ReviewResponse}
// @Failure 400,404 {object} utils.Response
// @Security BearerAuth
// @Router /reviews [post]
func (h *ReviewHandler) CreateReview(c *gin.Context) {
	var req service.CreateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, "无效的请求参数")
		return
	}

	// 从上下文获取用户ID
	userID := utils.GetUserIDFromContext(c)
	if userID == "" {
		utils.UnauthorizedError(c)
		return
	}

	review, err := h.reviewService.CreateReview(c, userID, &req)
	if err != nil {
		if err == service.ErrProductNotFound {
			utils.NotFoundError(c, err.Error())
			return
		}
		utils.InternalError(c, err)
		return
	}

	utils.SuccessWithMessage(c, "创建测评成功", review)
}

// UpdateReview 更新测评
// @Summary 更新测评信息
// @Description 更新指定测评的信息
// @Tags 测评管理
// @Accept json
// @Produce json
// @Param id path string true "测评ID"
// @Param request body service.UpdateReviewRequest true "测评更新信息"
// @Success 200 {object} utils.Response{data=service.ReviewResponse}
// @Failure 400,404 {object} utils.Response
// @Security BearerAuth
// @Router /reviews/{id} [put]
func (h *ReviewHandler) UpdateReview(c *gin.Context) {
	id := c.Param("id")

	var req service.UpdateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, "无效的请求参数")
		return
	}

	review, err := h.reviewService.UpdateReview(c, id, &req)
	if err != nil {
		if err == service.ErrReviewNotFound {
			utils.NotFoundError(c, err.Error())
			return
		}
		utils.InternalError(c, err)
		return
	}

	utils.SuccessWithMessage(c, "更新测评成功", review)
}

// DeleteReview 删除测评
// @Summary 删除测评
// @Description 删除指定的测评
// @Tags 测评管理
// @Produce json
// @Param id path string true "测评ID"
// @Success 200 {object} utils.Response
// @Failure 400,404 {object} utils.Response
// @Security BearerAuth
// @Router /reviews/{id} [delete]
func (h *ReviewHandler) DeleteReview(c *gin.Context) {
	id := c.Param("id")

	if err := h.reviewService.DeleteReview(c, id); err != nil {
		if err == service.ErrReviewNotFound {
			utils.NotFoundError(c, err.Error())
			return
		}
		utils.InternalError(c, err)
		return
	}

	utils.SuccessWithMessage(c, "删除测评成功", nil)
}

// GetReview 获取测评详情
// @Summary 获取测评详情
// @Description 获取指定测评的详细信息
// @Tags 测评管理
// @Produce json
// @Param id path string true "测评ID"
// @Success 200 {object} utils.Response{data=service.ReviewResponse}
// @Failure 400,404 {object} utils.Response
// @Router /reviews/{id} [get]
func (h *ReviewHandler) GetReview(c *gin.Context) {
	id := c.Param("id")

	review, err := h.reviewService.GetReview(c, id)
	if err != nil {
		if err == service.ErrReviewNotFound {
			utils.NotFoundError(c, err.Error())
			return
		}
		utils.InternalError(c, err)
		return
	}

	utils.Success(c, review)
}

// GetReviewBySlug 通过 slug 获取测评详情
// @Summary 通过 slug 获取测评详情
// @Description 获取指定测评的详细信息
// @Tags 测评管理
// @Produce json
// @Param slug path string true "测评 Slug"
// @Success 200 {object} utils.Response{data=service.ReviewResponse}
// @Failure 400,404 {object} utils.Response
// @Router /reviews/{slug} [get]
func (h *ReviewHandler) GetReviewBySlug(c *gin.Context) {
	slug := c.Param("slug")
	if slug == "" {
		utils.ParamError(c, "slug 不能为空")
		return
	}

	review, err := h.reviewService.GetReviewBySlug(c, slug)
	if err != nil {
		switch err {
		case service.ErrReviewNotFound:
			utils.NotFoundError(c, err.Error())
		default:
			utils.InternalError(c, err)
		}
		return
	}

	utils.Success(c, review)
}

// GetProductByReviewSlug 通过测评 slug 获取产品详情
// @Summary 通过测评 slug 获取产品详情
// @Description 获取指定测评相关的产品详细信息
// @Tags 测评管理
// @Accept json
// @Produce json
// @Param slug path string true "测评 Slug"
// @Success 200 {object} utils.Response{data=service.ProductResponse}
// @Failure 400,404,500 {object} utils.Response
// @Router /reviews/{slug}/product [get]
func (h *ReviewHandler) GetProductByReviewSlug(c *gin.Context) {
	slug := c.Param("slug")
	if slug == "" {
		utils.ParamError(c, "slug 不能为空")
		return
	}

	product, err := h.reviewService.GetProductByReviewSlug(c, slug)
	if err != nil {
		switch err {
		case service.ErrReviewNotFound:
			utils.NotFoundError(c, "测评不存在")
		case service.ErrProductNotFound:
			utils.NotFoundError(c, "产品不存在")
		default:
			utils.InternalError(c, err)
		}
		return
	}

	utils.Success(c, product)
}

// ListReviews 获取测评列表
// @Summary 获取测评列表
// @Description 获取测评列表，支持分页和状态筛选，默认只返回已发布的测评
// @Tags 测评管理
// @Produce json
// @Param page query int false "页码" default(1) minimum(1)
// @Param pageSize query int false "每页数量" default(10) minimum(1)
// @Param status query string false "状态筛选" Enums(pending,published,rejected)
// @Success 200 {object} utils.Response{data=utils.PageData{list=[]service.ReviewResponse}}
// @Router /reviews [get]
func (h *ReviewHandler) ListReviews(c *gin.Context) {
	page, pageSize := utils.GetPageInfo(c)
	status := c.Query("status")

	reviews, total, err := h.reviewService.ListReviews(c, page, pageSize, status)
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	utils.PageSuccess(c, reviews, total, page, pageSize)
}

// ListProductReviews 获取产品的测评列表
// @Summary 获取产品的测评列表
// @Description 获取指定产品的测评列表，支持分页，只返回已发布的测评
// @Tags 测评管理
// @Produce json
// @Param productId path uint true "产品ID"
// @Param page query int false "页码" default(1) minimum(1)
// @Param pageSize query int false "每页数量" default(10) minimum(1)
// @Success 200 {object} utils.Response{data=utils.PageData{list=[]service.ReviewResponse}}
// @Failure 404 {object} utils.Response "产品不存在"
// @Router /products/{id}/reviews [get]
func (h *ReviewHandler) ListProductReviews(c *gin.Context) {
	productID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ParamError(c, "无效的产品ID")
		return
	}

	page, pageSize := utils.GetPageInfo(c)

	reviews, total, err := h.reviewService.ListProductReviews(c, uint(productID), page, pageSize)
	if err != nil {
		if err.Error() == "产品不存在" {
			utils.NotFoundError(c, err.Error())
			return
		}
		utils.InternalError(c, err)
		return
	}

	utils.PageSuccess(c, reviews, total, page, pageSize)
}
