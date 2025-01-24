package utils

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Response 基础响应结构
type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Total   int64       `json:"total,omitempty"`
}

// PageData 分页数据结构
type PageData struct {
	List     interface{} `json:"list"`     // 数据列表
	Total    int64       `json:"total"`    // 总记录数
	Page     int         `json:"page"`     // 当前页码
	PageSize int         `json:"pageSize"` // 每页大小
}

// Success 成功响应
func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code:    0,
		Message: "success",
		Data:    data,
	})
}

// SuccessWithMessage 带消息的成功响应
func SuccessWithMessage(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code:    0,
		Message: message,
		Data:    data,
	})
}

// SuccessWithTotal 返回带总数的成功响应
func SuccessWithTotal(c *gin.Context, data interface{}, total int64) {
	c.JSON(http.StatusOK, Response{
		Code:    0,
		Message: "success",
		Data:    data,
		Total:   total,
	})
}

// Error 错误响应
func Error(c *gin.Context, status int, message string) {
	c.JSON(status, Response{
		Code:    status,
		Message: message,
	})
}

// ErrorWithData 带数据的错误响应
func ErrorWithData(c *gin.Context, status int, message string, data interface{}) {
	c.JSON(status, Response{
		Code:    status,
		Message: message,
		Data:    data,
	})
}

// ParamError 参数错误响应
func ParamError(c *gin.Context, message string) {
	c.JSON(http.StatusBadRequest, Response{
		Code:    400,
		Message: message,
	})
}

// ValidationError 数据验证错误响应
func ValidationError(c *gin.Context, message string) {
	c.JSON(http.StatusBadRequest, Response{
		Code:    400,
		Message: message,
	})
}

// NotFoundError 资源不存在错误响应
func NotFoundError(c *gin.Context, message string) {
	c.JSON(http.StatusNotFound, Response{
		Code:    404,
		Message: message,
	})
}

// UnauthorizedError 未授权错误响应
func UnauthorizedError(c *gin.Context) {
	c.JSON(http.StatusUnauthorized, Response{
		Code:    401,
		Message: "unauthorized",
	})
}

// ForbiddenError 禁止访问错误响应
func ForbiddenError(c *gin.Context) {
	c.JSON(http.StatusForbidden, Response{
		Code:    403,
		Message: "forbidden",
	})
}

// ServerError 服务器错误响应
func ServerError(c *gin.Context, message string) {
	c.JSON(http.StatusInternalServerError, Response{
		Code:    500,
		Message: message,
	})
}

// DatabaseError 数据库错误响应
func DatabaseError(c *gin.Context, err error) {
	Error(c, http.StatusInternalServerError, "数据库错误: "+err.Error())
}

// InternalError 服务器内部错误响应
func InternalError(c *gin.Context, err error) {
	Error(c, http.StatusInternalServerError, "服务器内部错误: "+err.Error())
}

// ConflictError 资源冲突错误响应
func ConflictError(c *gin.Context, message string) {
	Error(c, http.StatusConflict, message)
}

// TooManyRequests 返回请求过于频繁的错误
func TooManyRequests(c *gin.Context, message string) {
	c.JSON(http.StatusTooManyRequests, Response{
		Code:    1,
		Message: message,
	})
}

// PageSuccess 分页成功响应
func PageSuccess(c *gin.Context, list interface{}, total int64, page, pageSize int) {
	Success(c, PageData{
		List:     list,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	})
}

// GetPageInfo 获取分页参数
func GetPageInfo(c *gin.Context) (page, pageSize int) {
	page = 1
	pageSize = 10

	if p := c.Query("page"); p != "" {
		if pageNum, err := parseInt(p); err == nil && pageNum > 0 {
			page = pageNum
		}
	}

	if ps := c.Query("pageSize"); ps != "" {
		if size, err := parseInt(ps); err == nil && size > 0 {
			pageSize = size
		}
	}

	return
}

// parseInt 转换字符串为整数
func parseInt(s string) (int, error) {
	var result int
	_, err := fmt.Sscanf(s, "%d", &result)
	return result, err
}
