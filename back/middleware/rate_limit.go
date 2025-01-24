package middleware

import (
	"beicun/back/config"
	"beicun/back/database"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/ulule/limiter/v3"
	"github.com/ulule/limiter/v3/drivers/store/redis"
)

// RateLimitMiddleware 速率限制中间件
func RateLimitMiddleware(cfg *config.Config) gin.HandlerFunc {
	// 创建 Redis 存储
	store, err := redis.NewStore(database.GetRedis())
	if err != nil {
		panic(err)
	}

	// 创建速率限制器
	rate := limiter.Rate{
		Period: cfg.RateLimit.Period,
		Limit:  cfg.RateLimit.Limit,
	}
	rateLimiter := limiter.New(store, rate)

	return func(c *gin.Context) {
		// 获取当前请求的IP
		clientIP := c.ClientIP()

		// 检查是否允许请求
		ctx := c.Request.Context()
		limiterCtx, err := rateLimiter.Get(ctx, clientIP)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
				"code":    500,
				"message": "速率限制服务错误",
			})
			return
		}

		// 设置速率限制头部
		c.Header("X-RateLimit-Limit", strconv.FormatInt(limiterCtx.Limit, 10))
		c.Header("X-RateLimit-Remaining", strconv.FormatInt(limiterCtx.Remaining, 10))
		c.Header("X-RateLimit-Reset", strconv.FormatInt(limiterCtx.Reset, 10))

		if !limiterCtx.Reached {
			c.Next()
			return
		}

		c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
			"code":    429,
			"message": "请求过于频繁，请稍后再试",
		})
	}
}
