package utils

import (
	"beicun/back/model"
	"errors"

	"github.com/gin-gonic/gin"
)

const (
	// 上下文键
	UserIDKey   = "userID"
	UserRoleKey = "userRole"
	UserKey     = "user"
)

var (
	// 错误定义
	ErrUserNotAuthenticated = errors.New("用户未经过身份验证")
	ErrInvalidUserRole     = errors.New("无效的用户角色")
)

// GetUserIDFromContext 从上下文中获取用户ID
func GetUserIDFromContext(c *gin.Context) string {
	userID, exists := c.Get(UserIDKey)
	if !exists {
		return ""
	}
	if id, ok := userID.(string); ok {
		return id
	}
	return ""
}

// GetUserRoleFromContext 从上下文中获取用户角色
func GetUserRoleFromContext(c *gin.Context) model.UserRole {
	role, exists := c.Get(UserRoleKey)
	if !exists {
		return model.UserRoleGuest
	}
	if r, ok := role.(model.UserRole); ok {
		return r
	}
	return model.UserRoleGuest
}

// GetUserFromContext 从上下文中获取用户信息
func GetUserFromContext(c *gin.Context) *model.User {
	user, exists := c.Get(UserKey)
	if !exists {
		return nil
	}
	if u, ok := user.(*model.User); ok {
		return u
	}
	return nil
}

// MustGetUserID 从上下文中获取用户ID，如果不存在则返回错误
func MustGetUserID(c *gin.Context) (string, error) {
	userID := GetUserIDFromContext(c)
	if userID == "" {
		return "", ErrUserNotAuthenticated
	}
	return userID, nil
}

// MustGetUser 从上下文中获取用户信息，如果不存在则返回错误
func MustGetUser(c *gin.Context) (*model.User, error) {
	user := GetUserFromContext(c)
	if user == nil {
		return nil, ErrUserNotAuthenticated
	}
	return user, nil
}

// SetUserContext 设置用户上下文
func SetUserContext(c *gin.Context, user *model.User) {
	if user == nil {
		return
	}
	c.Set(UserIDKey, user.ID)
	c.Set(UserRoleKey, user.Role)
	c.Set(UserKey, user)
}

// ClearUserContext 清除用户上下文
func ClearUserContext(c *gin.Context) {
	c.Set(UserIDKey, "")
	c.Set(UserRoleKey, model.UserRoleGuest)
	c.Set(UserKey, nil)
}

// RequireRole 检查用户是否具有指定角色
func RequireRole(c *gin.Context, role model.UserRole) error {
	userRole := GetUserRoleFromContext(c)
	if userRole != role {
		return ErrInvalidUserRole
	}
	return nil
}

// RequireAdmin 检查用户是否是管理员
func RequireAdmin(c *gin.Context) error {
	return RequireRole(c, model.UserRoleAdmin)
}

// RequireUser 检查用户是否是普通用户
func RequireUser(c *gin.Context) error {
	return RequireRole(c, model.UserRoleUser)
}
