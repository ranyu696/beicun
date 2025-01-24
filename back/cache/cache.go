package cache

import (
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"

	"beicun/back/database"
	"beicun/back/model"
)

const (
	// 缓存键前缀
	ProductKeyPrefix     = "product:"
	UserKeyPrefix        = "user:"
	ReviewKeyPrefix      = "review:"
	ProductListKeyPrefix = "product_list:"
	ReviewListKeyPrefix  = "review_list:"
	UserStatsPrefix      = "stats:user:"
	ProductStatsPrefix   = "stats:product:"
	RatingStatsPrefix    = "stats:rating:"

	// 缓存过期时间
	ProductExpiration     = 24 * time.Hour
	UserExpiration        = 24 * time.Hour
	ReviewExpiration      = 24 * time.Hour
	ProductListExpiration = 1 * time.Hour
	ReviewListExpiration  = 1 * time.Hour
	StatsExpiration       = 30 * time.Minute
)

// Cache 缓存接口
type Cache interface {
	// 产品相关
	GetProduct(c *gin.Context, id uint) (*model.Product, error)
	SetProduct(c *gin.Context, product *model.Product) error
	DeleteProduct(c *gin.Context, id uint) error
	GetProductList(c *gin.Context, key string) ([]*model.Product, error)
	SetProductList(c *gin.Context, key string, products []*model.Product) error

	// 用户相关
	GetUser(c *gin.Context, id string) (*model.User, error)
	SetUser(c *gin.Context, user *model.User) error
	DeleteUser(c *gin.Context, id string) error

	// 测评相关
	GetReview(c *gin.Context, id string) (*model.Review, error)
	SetReview(c *gin.Context, review *model.Review) error
	DeleteReview(c *gin.Context, id string) error
	GetReviewList(c *gin.Context, key string) ([]*model.Review, error)
	SetReviewList(c *gin.Context, key string, reviews []*model.Review) error

	// 统计相关
	GetUserStats(c *gin.Context) (*UserStats, error)
	SetUserStats(c *gin.Context, stats *UserStats) error
	GetProductStats(c *gin.Context) (*ProductStats, error)
	SetProductStats(c *gin.Context, stats *ProductStats) error
	GetRatingStats(c *gin.Context, productID uint) (*RatingStats, error)
	SetRatingStats(c *gin.Context, productID uint, stats *RatingStats) error
}

// RedisCache Redis缓存实现
type RedisCache struct {
	client *redis.Client
}

// NewRedisCache 创建Redis缓存实例
func NewRedisCache() Cache {
	return &RedisCache{
		client: database.GetRedis(),
	}
}

// GetProduct 获取产品缓存
func (c *RedisCache) GetProduct(ctx *gin.Context, id uint) (*model.Product, error) {
	key := ProductKeyPrefix + strconv.FormatUint(uint64(id), 10)
	data, err := c.client.Get(ctx, key).Bytes()
	if err != nil {
		if err == redis.Nil {
			return nil, nil
		}
		return nil, err
	}

	var product model.Product
	if err := json.Unmarshal(data, &product); err != nil {
		return nil, err
	}

	return &product, nil
}

// SetProduct 设置产品缓存
func (c *RedisCache) SetProduct(ctx *gin.Context, product *model.Product) error {
	data, err := json.Marshal(product)
	if err != nil {
		return err
	}

	// 将产品ID转换为字符串
	key := ProductKeyPrefix + strconv.FormatUint(uint64(product.ID), 10)
	return c.client.Set(ctx, key, data, ProductExpiration).Err()
}

// DeleteProduct 删除产品缓存
func (c *RedisCache) DeleteProduct(ctx *gin.Context, id uint) error {
	key := ProductKeyPrefix + strconv.FormatUint(uint64(id), 10)
	return c.client.Del(ctx, key).Err()
}

// GetProductList 获取产品列表缓存
func (c *RedisCache) GetProductList(ctx *gin.Context, key string) ([]*model.Product, error) {
	data, err := c.client.Get(ctx, ProductListKeyPrefix+key).Bytes()
	if err != nil {
		if err == redis.Nil {
			return nil, nil
		}
		return nil, err
	}

	var products []*model.Product
	if err := json.Unmarshal(data, &products); err != nil {
		return nil, err
	}

	return products, nil
}

// SetProductList 设置产品列表缓存
func (c *RedisCache) SetProductList(ctx *gin.Context, key string, products []*model.Product) error {
	data, err := json.Marshal(products)
	if err != nil {
		return err
	}

	return c.client.Set(ctx, ProductListKeyPrefix+key, data, ProductListExpiration).Err()
}

// GetUser 获取用户缓存
func (c *RedisCache) GetUser(ctx *gin.Context, id string) (*model.User, error) {
	key := UserKeyPrefix + id
	data, err := c.client.Get(ctx, key).Bytes()
	if err != nil {
		if err == redis.Nil {
			return nil, nil
		}
		return nil, err
	}

	var user model.User
	if err := json.Unmarshal(data, &user); err != nil {
		return nil, err
	}

	return &user, nil
}

// SetUser 设置用户缓存
func (c *RedisCache) SetUser(ctx *gin.Context, user *model.User) error {
	data, err := json.Marshal(user)
	if err != nil {
		return err
	}

	key := UserKeyPrefix + user.ID
	return c.client.Set(ctx, key, data, UserExpiration).Err()
}

// DeleteUser 删除用户缓存
func (c *RedisCache) DeleteUser(ctx *gin.Context, id string) error {
	key := UserKeyPrefix + id
	return c.client.Del(ctx, key).Err()
}

// GetReview 获取测评缓存
func (c *RedisCache) GetReview(ctx *gin.Context, id string) (*model.Review, error) {
	key := ReviewKeyPrefix + id
	data, err := c.client.Get(ctx, key).Bytes()
	if err != nil {
		if err == redis.Nil {
			return nil, nil
		}
		return nil, err
	}

	var review model.Review
	if err := json.Unmarshal(data, &review); err != nil {
		return nil, err
	}

	return &review, nil
}

// SetReview 设置测评缓存
func (c *RedisCache) SetReview(ctx *gin.Context, review *model.Review) error {
	data, err := json.Marshal(review)
	if err != nil {
		return err
	}

	key := ReviewKeyPrefix + review.ID
	return c.client.Set(ctx, key, data, ReviewExpiration).Err()
}

// DeleteReview 删除测评缓存
func (c *RedisCache) DeleteReview(ctx *gin.Context, id string) error {
	key := ReviewKeyPrefix + id
	return c.client.Del(ctx, key).Err()
}

// GetReviewList 获取测评列表缓存
func (c *RedisCache) GetReviewList(ctx *gin.Context, key string) ([]*model.Review, error) {
	data, err := c.client.Get(ctx, ReviewListKeyPrefix+key).Bytes()
	if err != nil {
		if err == redis.Nil {
			return nil, nil
		}
		return nil, err
	}

	var reviews []*model.Review
	if err := json.Unmarshal(data, &reviews); err != nil {
		return nil, err
	}

	return reviews, nil
}

// SetReviewList 设置测评列表缓存
func (c *RedisCache) SetReviewList(ctx *gin.Context, key string, reviews []*model.Review) error {
	data, err := json.Marshal(reviews)
	if err != nil {
		return err
	}

	return c.client.Set(ctx, ReviewListKeyPrefix+key, data, ReviewListExpiration).Err()
}

// 统计数据结构
type UserStats struct {
	TotalUsers        int64                    `json:"totalUsers"`
	NewUsersToday     int64                    `json:"newUsersToday"`
	NewUsersThisWeek  int64                    `json:"newUsersThisWeek"`
	NewUsersThisMonth int64                    `json:"newUsersThisMonth"`
	UsersByRole       map[model.UserRole]int64 `json:"usersByRole"`
	TopReviewers      []TopReviewer            `json:"topReviewers"`
}

type TopReviewer struct {
	UserID        string  `json:"userId"`
	Username      string  `json:"username"`
	ReviewCount   int64   `json:"reviewCount"`
	AverageRating float64 `json:"averageRating"`
}

type ProductStats struct {
	TotalProducts        int64                 `json:"totalProducts"`
	ProductsByType       map[string]int64      `json:"productsByType"`
	ProductsByUtility    map[string]int64      `json:"productsByUtility"`
	TopRatedProducts     []TopRatedProduct     `json:"topRatedProducts"`
	MostReviewedProducts []MostReviewedProduct `json:"mostReviewedProducts"`
}

type TopRatedProduct struct {
	ProductID     uint    `json:"productId"`
	Name          string  `json:"name"`
	AverageRating float64 `json:"averageRating"`
	ReviewCount   int64   `json:"reviewCount"`
}

type MostReviewedProduct struct {
	ProductID     uint    `json:"productId"`
	Name          string  `json:"name"`
	ReviewCount   int64   `json:"reviewCount"`
	AverageRating float64 `json:"averageRating"`
}

type RatingStats struct {
	ProductID     uint           `json:"productId"`
	ProductName   string         `json:"productName"`
	AverageRating float64        `json:"averageRating"`
	TotalRatings  int64          `json:"totalRatings"`
	RatingCounts  map[int]int64  `json:"ratingCounts"`
	RecentReviews []RecentReview `json:"recentReviews"`
}

type RecentReview struct {
	ReviewID  string    `json:"reviewId"`
	UserID    string    `json:"userId"`
	Username  string    `json:"username"`
	Rating    int       `json:"rating"`
	Comment   string    `json:"comment"`
	CreatedAt time.Time `json:"createdAt"`
}

// GetUserStats 获取用户统计数据缓存
func (c *RedisCache) GetUserStats(ctx *gin.Context) (*UserStats, error) {
	data, err := c.client.Get(ctx, UserStatsPrefix).Bytes()
	if err != nil {
		if err == redis.Nil {
			return nil, nil
		}
		return nil, err
	}

	var stats UserStats
	if err := json.Unmarshal(data, &stats); err != nil {
		return nil, err
	}

	return &stats, nil
}

// SetUserStats 设置用户统计数据缓存
func (c *RedisCache) SetUserStats(ctx *gin.Context, stats *UserStats) error {
	data, err := json.Marshal(stats)
	if err != nil {
		return err
	}

	return c.client.Set(ctx, UserStatsPrefix, data, StatsExpiration).Err()
}

// GetProductStats 获取产品统计数据缓存
func (c *RedisCache) GetProductStats(ctx *gin.Context) (*ProductStats, error) {
	data, err := c.client.Get(ctx, ProductStatsPrefix).Bytes()
	if err != nil {
		if err == redis.Nil {
			return nil, nil
		}
		return nil, err
	}

	var stats ProductStats
	if err := json.Unmarshal(data, &stats); err != nil {
		return nil, err
	}

	return &stats, nil
}

// SetProductStats 设置产品统计数据缓存
func (c *RedisCache) SetProductStats(ctx *gin.Context, stats *ProductStats) error {
	data, err := json.Marshal(stats)
	if err != nil {
		return err
	}

	return c.client.Set(ctx, ProductStatsPrefix, data, StatsExpiration).Err()
}

// GetRatingStats 获取评分统计数据缓存
func (c *RedisCache) GetRatingStats(ctx *gin.Context, productID uint) (*RatingStats, error) {
	key := RatingStatsPrefix + strconv.FormatUint(uint64(productID), 10)
	data, err := c.client.Get(ctx, key).Bytes()
	if err != nil {
		if err == redis.Nil {
			return nil, nil
		}
		return nil, err
	}

	var stats RatingStats
	if err := json.Unmarshal(data, &stats); err != nil {
		return nil, err
	}

	return &stats, nil
}

// SetRatingStats 设置评分统计数据缓存
func (c *RedisCache) SetRatingStats(ctx *gin.Context, productID uint, stats *RatingStats) error {
	data, err := json.Marshal(stats)
	if err != nil {
		return err
	}

	key := RatingStatsPrefix + strconv.FormatUint(uint64(productID), 10)
	return c.client.Set(ctx, key, data, StatsExpiration).Err()
}

// BuildListKey 构建列表缓存键
func BuildListKey(params map[string]interface{}) string {
	key := ""
	for k, v := range params {
		key += fmt.Sprintf("%s:%v:", k, v)
	}
	return key
}
