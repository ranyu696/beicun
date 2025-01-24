package handler

import (
	"beicun/back/model"
	"beicun/back/service"
	"beicun/back/utils"
	"github.com/gin-gonic/gin"
	"strconv"
)

// UserHandler 用户处理器
type UserHandler struct {
	userService *service.UserService
}

// NewUserHandler 创建用户处理器实例
func NewUserHandler(userService *service.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

// GetCurrentUser 获取当前用户信息
func (h *UserHandler) GetCurrentUser(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)
	user, err := h.userService.GetCurrentUser(c, userID)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.Success(c, user)
}

// UpdateCurrentUser 更新当前用户信息
type UpdateUserRequest struct {
	Name   string `json:"name"`
	Avatar string `json:"avatar"`
	Bio    string `json:"bio"`
}

func (h *UserHandler) UpdateCurrentUser(c *gin.Context) {
	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, "无效的请求参数")
		return
	}

	userID := utils.GetUserIDFromContext(c)
	updates := map[string]interface{}{
		"name":   req.Name,
		"avatar": req.Avatar,
		"bio":    req.Bio,
	}

	user, err := h.userService.UpdateCurrentUser(c, userID, updates)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.Success(c, user)
}

// ListCurrentUserReviews 获取当前用户的测评列表
func (h *UserHandler) ListCurrentUserReviews(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

	userID := utils.GetUserIDFromContext(c)
	reviews, total, err := h.userService.ListCurrentUserReviews(c, userID, page, pageSize)
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	utils.PageSuccess(c, reviews, total, page, pageSize)
}

// ListCurrentUserFavorites 获取当前用户的收藏列表
func (h *UserHandler) ListCurrentUserFavorites(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

	userID := utils.GetUserIDFromContext(c)
	products, total, err := h.userService.ListCurrentUserFavorites(c, userID, page, pageSize)
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	utils.PageSuccess(c, products, total, page, pageSize)
}

// AddToFavorites 添加收藏
func (h *UserHandler) AddToFavorites(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)
	productID := c.Param("productId")

	if err := h.userService.AddToFavorites(c, userID, productID); err != nil {
		utils.InternalError(c, err)
		return
	}

	utils.SuccessWithMessage(c, "添加收藏成功", nil)
}

// RemoveFromFavorites 取消收藏
func (h *UserHandler) RemoveFromFavorites(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)
	productID := c.Param("productId")

	if err := h.userService.RemoveFromFavorites(c, userID, productID); err != nil {
		utils.InternalError(c, err)
		return
	}

	utils.SuccessWithMessage(c, "取消收藏成功", nil)
}

// ListUsers 获取用户列表（管理员）
func (h *UserHandler) ListUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

	users, total, err := h.userService.ListUsers(c, page, pageSize)
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	utils.PageSuccess(c, users, total, page, pageSize)
}

// GetUser 获取单个用户信息（管理员）
func (h *UserHandler) GetUser(c *gin.Context) {
	userID := c.Param("id")
	user, err := h.userService.GetUser(c, userID)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.Success(c, user)
}

// UpdateUser 更新用户信息（管理员）
type AdminUpdateUserRequest struct {
	Name   string          `json:"name"`
	Avatar string          `json:"avatar"`
	Bio    string          `json:"bio"`
	Role   model.UserRole  `json:"role"`
}

func (h *UserHandler) UpdateUser(c *gin.Context) {
	var req AdminUpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, "无效的请求参数")
		return
	}

	userID := c.Param("id")
	updates := map[string]interface{}{
		"name":   req.Name,
		"avatar": req.Avatar,
		"bio":    req.Bio,
		"role":   req.Role,
	}

	user, err := h.userService.UpdateUser(c, userID, updates)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.Success(c, user)
}

// DeleteUser 删除用户（管理员）
func (h *UserHandler) DeleteUser(c *gin.Context) {
	userID := c.Param("id")
	if err := h.userService.DeleteUser(c, userID); err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.SuccessWithMessage(c, "删除成功", nil)
}

// UpdateUserStatus 更新用户状态（管理员）
type UpdateUserStatusRequest struct {
	Status model.UserStatus `json:"status" binding:"required"`
}

func (h *UserHandler) UpdateUserStatus(c *gin.Context) {
	var req UpdateUserStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, "无效的请求参数")
		return
	}

	userID := c.Param("id")
	if err := h.userService.UpdateUserStatus(c, userID, req.Status); err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.SuccessWithMessage(c, "状态更新成功", nil)
}
