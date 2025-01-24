package handler

import (
	"strconv"

	"github.com/gin-gonic/gin"

	"beicun/back/service"
	"beicun/back/utils"
)

type StatsHandler struct {
	statsService *service.StatsService
}

func NewStatsHandler(statsService *service.StatsService) *StatsHandler {
	return &StatsHandler{
		statsService: statsService,
	}
}

// GetUserStats 获取用户统计
func (h *StatsHandler) GetUserStats(c *gin.Context) {
	stats, err := h.statsService.GetUserStats(c)
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	utils.Success(c, stats)
}

// GetProductStats 获取产品统计
func (h *StatsHandler) GetProductStats(c *gin.Context) {
	stats, err := h.statsService.GetProductStats(c)
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	utils.Success(c, stats)
}

// GetRatingStats 获取产品评分统计数据
// @Summary 获取产品评分统计数据
// @Description 获取产品评分相关的统计数据
// @Tags 统计
// @Accept json
// @Produce json
// @Param id path uint true "产品ID"
// @Success 200 {object} cache.RatingStats
// @Router /api/stats/products/{id}/ratings [get]
func (h *StatsHandler) GetRatingStats(c *gin.Context) {
	productID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ParamError(c, "无效的产品ID")
		return
	}

	stats, err := h.statsService.GetRatingStats(c, uint(productID))
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	utils.Success(c, stats)
}

// GetDashboardStats 获取仪表盘统计数据
// @Summary 获取仪表盘统计数据
// @Description 获取网站整体的统计数据，包括用户、产品、测评、评论等
// @Tags 统计
// @Accept json
// @Produce json
// @Success 200 {object} utils.Response{data=service.DashboardStats}
// @Failure 500 {object} utils.Response
// @Router /admin/stats/dashboard [get]
func (h *StatsHandler) GetDashboardStats(c *gin.Context) {
	stats, err := h.statsService.GetDashboardStats(c)
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	utils.Success(c, stats)
}
