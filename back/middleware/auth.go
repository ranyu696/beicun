package middleware

import (
	"beicun/back/model"
	"beicun/back/service"
	"beicun/back/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware 认证中间件
type AuthMiddleware struct {
	authService *service.AuthService
	jwtSecret   []byte
}

// NewAuthMiddleware 创建认证中间件实例
func NewAuthMiddleware(authService *service.AuthService, jwtSecret string) *AuthMiddleware {
	return &AuthMiddleware{
		authService: authService,
		jwtSecret:   []byte(jwtSecret),
	}
}

// RequireAuth 需要认证
func (m *AuthMiddleware) RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 从请求头获取令牌
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "未提供认证令牌"})
			return
		}

		// 解析令牌
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := utils.ParseToken(tokenString, m.jwtSecret)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "无效的认证令牌"})
			return
		}

		// 获取用户信息
		user, err := m.authService.GetUserFromToken(c, claims)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "无效的用户信息"})
			return
		}

		// 设置用户信息到上下文
		utils.SetUserContext(c, user)
		c.Next()
	}
}

// RequireRole 需要特定角色
func (m *AuthMiddleware) RequireRole(role model.UserRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := utils.RequireRole(c, role); err != nil {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "无权访问"})
			return
		}
		c.Next()
	}
}

// RequireAdmin 需要管理员权限
func (m *AuthMiddleware) RequireAdmin() gin.HandlerFunc {
	return m.RequireRole(model.UserRoleAdmin)
}

// RequireUser 需要普通用户权限
func (m *AuthMiddleware) RequireUser() gin.HandlerFunc {
	return m.RequireRole(model.UserRoleUser)
}

