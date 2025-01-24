package handler

import (
	"beicun/back/service"
	"beicun/back/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *service.AuthService
	captchaService *service.CaptchaService
}

func NewAuthHandler(authService *service.AuthService , captchaService *service.CaptchaService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		captchaService: captchaService,
	}
}

// Login 用户登录
// @Summary 用户登录
// @Description 用户登录并返回JWT令牌
// @Tags 认证
// @Accept json
// @Produce json
// @Param request body service.LoginRequest true "登录请求"
// @Success 200 {object} utils.Response{data=service.TokenResponse}
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req service.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, "无效的请求参数")
		return
	}

	resp, err := h.authService.Login(c, &req)
	if err != nil {
		if err == service.ErrInvalidCredentials {
			utils.Error(c, http.StatusUnauthorized, err.Error())
			return
		}
		utils.InternalError(c, err)
		return
	}

	utils.Success(c, resp)
}

// Register 用户注册
// @Summary 用户注册
// @Description 注册新用户并返回JWT令牌
// @Tags 认证
// @Accept json
// @Produce json
// @Param request body service.RegisterRequest true "注册请求"
// @Success 200 {object} utils.Response{data=service.TokenResponse}
// @Failure 400 {object} utils.Response
// @Router /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req service.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, "无效的请求参数")
		return
	}

	resp, err := h.authService.Register(c, &req)
	if err != nil {
		if err == service.ErrEmailExists {
			utils.ValidationError(c, err.Error())
			return
		}
		utils.InternalError(c, err)
		return
	}

	utils.Success(c, resp)
}

// RefreshToken 刷新令牌
// @Summary 刷新访问令牌
// @Description 使用刷新令牌获取新的访问令牌
// @Tags 认证
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer {refreshToken}"
// @Success 200 {object} utils.Response{data=service.TokenResponse}
// @Failure 401 {object} utils.Response
// @Router /auth/refresh [post]
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	refreshToken := c.GetHeader("Authorization")
	if refreshToken == "" {
		utils.Error(c, http.StatusUnauthorized, "未提供刷新令牌")
		return
	}

	resp, err := h.authService.RefreshToken(c, refreshToken)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, err.Error())
		return
	}

	utils.Success(c, resp)
}

// ResetPassword 重置密码
// @Summary 重置密码（管理员）
// @Description 重置指定用户的密码
// @Tags 认证
// @Accept json
// @Produce json
// @Param userId query string true "用户ID"
// @Success 200 {object} utils.Response{data=string}
// @Failure 400 {object} utils.Response
// @Security BearerAuth
// @Router /admin/user/reset-password [post]
func (h *AuthHandler) ResetPassword(c *gin.Context) {
	userID := c.Query("userId")
	if userID == "" {
		utils.ParamError(c, "未提供用户ID")
		return
	}

	newPassword, err := h.authService.ResetPassword(c, userID)
	if err != nil {
		utils.ValidationError(c, err.Error())
		return
	}

	utils.Success(c, gin.H{
		"message":     "密码重置成功",
		"newPassword": newPassword,
	})
}

// ChangePassword 修改密码
// @Summary 修改密码
// @Description 修改用户密码
// @Tags 认证
// @Accept json
// @Produce json
// @Param request body ChangePasswordRequest true "修改密码请求"
// @Success 200 {object} utils.Response
// @Failure 400 {object} utils.Response
// @Security BearerAuth
// @Router /user/change-password [post]
func (h *AuthHandler) ChangePassword(c *gin.Context) {
	var req struct {
		OldPassword string `json:"oldPassword" binding:"required"`
		NewPassword string `json:"newPassword" binding:"required,min=6"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, "无效的请求参数")
		return
	}

	userID, err := utils.MustGetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, err.Error())
		return
	}

	if err := h.authService.ChangePassword(c, userID, req.OldPassword, req.NewPassword); err != nil {
		utils.ValidationError(c, err.Error())
		return
	}

	utils.Success(c, "密码修改成功")
}

// SendEmailCaptcha 发送验证码
// @Summary 发送邮箱验证码
// @Description 发送邮箱验证码，支持注册、重置密码和更换邮箱
// @Tags 验证码
// @Accept json
// @Produce json
// @Param request body SendEmailCaptchaRequest true "发送验证码请求"
// @Success 200 {object} utils.Response
// @Router /api/auth/code [post]
func (h *AuthHandler) GenerateCaptcha(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required,email"`
		Type  string `json:"type" binding:"required,oneof=register reset_password change_email"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, "请求参数错误")
		return
	}

	// 转换验证码类型
	var captchaType service.CaptchaType
	switch req.Type {
	case "register":
		captchaType = service.CaptchaTypeRegister
	case "reset_password":
		captchaType = service.CaptchaTypeResetPassword
	case "change_email":
		captchaType = service.CaptchaTypeChangeEmail
	default:
		utils.ParamError(c, "不支持的验证码类型")
		return
	}

	// 发送验证码
	if err := h.captchaService.SendEmailCaptcha(c, req.Email, captchaType); err != nil {
		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.Success(c, "验证码已发送")
}
