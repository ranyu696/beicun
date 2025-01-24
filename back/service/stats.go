package service

import (
	"beicun/back/model"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"beicun/back/cache"
)

type StatsService struct {
	db    *gorm.DB
	cache cache.Cache
}

func NewStatsService(db *gorm.DB, cache cache.Cache) *StatsService {
	return &StatsService{
		db:    db,
		cache: cache,
	}
}

type DashboardStats struct {
	TotalProducts     int64                  `json:"totalProducts"`     // 产品总数
	TotalUsers        int64                  `json:"totalUsers"`        // 用户总数
	TotalReviews      int64                  `json:"totalReviews"`      // 测评总数
	TotalComments     int64                  `json:"totalComments"`     // 评论总数
	PendingReviews    int64                  `json:"pendingReviews"`    // 待审核测评数
	PendingComments   int64                  `json:"pendingComments"`   // 待审核评论数
	TopProducts       []*ProductStats        `json:"topProducts"`       // 热门产品
	TopReviews        []*ReviewStats         `json:"topReviews"`        // 热门测评
	RecentActivities  []*ActivityStats       `json:"recentActivities"`  // 最近活动
	ProductsByType    []*ProductTypeStats    `json:"productsByType"`    // 产品类型分布
	ProductsByBrand   []*ProductBrandStats   `json:"productsByBrand"`   // 品牌分布
	ReviewTrend       []*ReviewTrendStats    `json:"reviewTrend"`       // 测评趋势
	CommentTrend      []*CommentTrendStats   `json:"commentTrend"`      // 评论趋势
}

type ProductStats struct {
	ID           uint   `json:"id"`
	Name         string  `json:"name"`
	ViewCount    int     `json:"viewCount"`
	ReviewCount  int     `json:"reviewCount"`
	CommentCount int     `json:"commentCount"`
	AverageRating float64 `json:"averageRating"`
}

type ReviewStats struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	ViewCount int       `json:"viewCount"`
	CreatedAt time.Time `json:"createdAt"`
	Author    string    `json:"author"`
}

type ActivityStats struct {
	Type      string    `json:"type"`      // 活动类型：REVIEW, COMMENT, RATING
	Content   string    `json:"content"`    // 活动内容
	UserName  string    `json:"userName"`   // 用户名
	CreatedAt time.Time `json:"createdAt"`  // 创建时间
}

type ProductTypeStats struct {
	TypeName string `json:"typeName"`
	Count    int64  `json:"count"`
}

type ProductBrandStats struct {
	BrandName string `json:"brandName"`
	Count     int64  `json:"count"`
}

type ReviewTrendStats struct {
	Date  string `json:"date"`
	Count int64  `json:"count"`
}

type CommentTrendStats struct {
	Date  string `json:"date"`
	Count int64  `json:"count"`
}

// GetDashboardStats 获取仪表盘统计数据
func (s *StatsService) GetDashboardStats(c *gin.Context) (*DashboardStats, error) {
	stats := &DashboardStats{}

	// 获取基础统计数据
	s.db.Model(&model.Product{}).Count(&stats.TotalProducts)
	s.db.Model(&model.User{}).Count(&stats.TotalUsers)
	s.db.Model(&model.Review{}).Count(&stats.TotalReviews)
	s.db.Model(&model.Comment{}).Count(&stats.TotalComments)
	s.db.Model(&model.Review{}).Where("status = ?", model.ReviewStatusPending).Count(&stats.PendingReviews)
	s.db.Model(&model.Comment{}).Where("status = ?", model.CommentStatusPending).Count(&stats.PendingComments)

	// 获取热门产品
	var topProducts []struct {
		model.Product
		ReviewCount  int `json:"reviewCount"`
		CommentCount int `json:"commentCount"`
	}
	s.db.Model(&model.Product{}).
		Select("products.*, COUNT(DISTINCT reviews.id) as review_count, COUNT(DISTINCT comments.id) as comment_count").
		Joins("LEFT JOIN reviews ON reviews.product_id = products.id").
		Joins("LEFT JOIN comments ON comments.review_id = reviews.id").
		Group("products.id").
		Order("view_count DESC").
		Limit(10).
		Find(&topProducts)

	stats.TopProducts = make([]*ProductStats, len(topProducts))
	for i, p := range topProducts {
		stats.TopProducts[i] = &ProductStats{
			ID:            p.ID,
			Name:          p.Name,
			ViewCount:     p.ViewCount,
			ReviewCount:   p.ReviewCount,
			CommentCount:  p.CommentCount,
			AverageRating: p.AverageRating,
		}
	}

	// 获取热门测评
	var topReviews []struct {
		model.Review
		AuthorName string `json:"authorName"`
	}
	s.db.Model(&model.Review{}).
		Select("reviews.*, users.name as author_name").
		Joins("LEFT JOIN users ON users.id = reviews.user_id").
		Where("reviews.status = ?", model.ReviewStatusPublished).
		Order("views DESC").
		Limit(10).
		Find(&topReviews)

	stats.TopReviews = make([]*ReviewStats, len(topReviews))
	for i, r := range topReviews {
		stats.TopReviews[i] = &ReviewStats{
			ID:        r.ID,
			Title:     r.Title,
			ViewCount: r.Views,
			CreatedAt: r.CreatedAt,
			Author:    r.AuthorName,
		}
	}

	// 获取最近活动
	activities := make([]*ActivityStats, 0)

	// 最近的测评
	var recentReviews []struct {
		model.Review
		UserName string `json:"userName"`
	}
	s.db.Model(&model.Review{}).
		Select("reviews.*, users.name as user_name").
		Joins("LEFT JOIN users ON users.id = reviews.user_id").
		Order("created_at DESC").
		Limit(5).
		Find(&recentReviews)

	for _, r := range recentReviews {
		activities = append(activities, &ActivityStats{
			Type:      "REVIEW",
			Content:   r.Title,
			UserName:  r.UserName,
			CreatedAt: r.CreatedAt,
		})
	}

	// 最近的评论
	var recentComments []struct {
		model.Comment
		UserName string `json:"userName"`
	}
	s.db.Model(&model.Comment{}).
		Select("comments.*, users.name as user_name").
		Joins("LEFT JOIN users ON users.id = comments.user_id").
		Order("created_at DESC").
		Limit(5).
		Find(&recentComments)

	for _, c := range recentComments {
		activities = append(activities, &ActivityStats{
			Type:      "COMMENT",
			Content:   c.Content,
			UserName:  c.UserName,
			CreatedAt: c.CreatedAt,
		})
	}

	// 最近的评分
	var recentRatings []struct {
		model.Rating
		UserName    string  `json:"userName"`
		ProductName string  `json:"productName"`
	}
	s.db.Model(&model.Rating{}).
		Select("ratings.*, users.name as user_name, products.name as product_name").
		Joins("LEFT JOIN users ON users.id = ratings.user_id").
		Joins("LEFT JOIN products ON products.id = ratings.product_id").
		Order("created_at DESC").
		Limit(5).
		Find(&recentRatings)

	for _, r := range recentRatings {
		activities = append(activities, &ActivityStats{
			Type:      "RATING",
			Content:   r.ProductName,
			UserName:  r.UserName,
			CreatedAt: r.CreatedAt,
		})
	}

	// 按时间排序所有活动
	stats.RecentActivities = activities

	// 获取产品类型分布
	s.db.Model(&model.Product{}).
		Select("product_types.name as type_name, COUNT(*) as count").
		Joins("LEFT JOIN product_types ON product_types.id = products.product_type_id").
		Group("product_types.name").
		Find(&stats.ProductsByType)

	// 获取品牌分布
	s.db.Model(&model.Product{}).
		Select("brands.name as brand_name, COUNT(*) as count").
		Joins("LEFT JOIN brands ON brands.id = products.brand_id").
		Group("brands.name").
		Find(&stats.ProductsByBrand)

	// 获取最近30天的测评趋势
	var reviewTrend []struct {
		Date  string `json:"date"`
		Count int64  `json:"count"`
	}
	s.db.Model(&model.Review{}).
		Select("DATE(created_at) as date, COUNT(*) as count").
		Where("created_at >= ?", time.Now().AddDate(0, 0, -30)).
		Group("DATE(created_at)").
		Order("date").
		Find(&reviewTrend)

	stats.ReviewTrend = make([]*ReviewTrendStats, len(reviewTrend))
	for i, t := range reviewTrend {
		stats.ReviewTrend[i] = &ReviewTrendStats{
			Date:  t.Date,
			Count: t.Count,
		}
	}

	// 获取最近30天的评论趋势
	var commentTrend []struct {
		Date  string `json:"date"`
		Count int64  `json:"count"`
	}
	s.db.Model(&model.Comment{}).
		Select("DATE(created_at) as date, COUNT(*) as count").
		Where("created_at >= ?", time.Now().AddDate(0, 0, -30)).
		Group("DATE(created_at)").
		Order("date").
		Find(&commentTrend)

	stats.CommentTrend = make([]*CommentTrendStats, len(commentTrend))
	for i, t := range commentTrend {
		stats.CommentTrend[i] = &CommentTrendStats{
			Date:  t.Date,
			Count: t.Count,
		}
	}

	return stats, nil
}

// GetUserStats 获取用户统计数据
func (s *StatsService) GetUserStats(c *gin.Context) (*cache.UserStats, error) {
	// 尝试从缓存获取
	stats, err := s.cache.GetUserStats(c)
	if err != nil {
		return nil, err
	}

	if stats == nil {
		// 从数据库计算统计信息
		var totalUsers int64
		s.db.Model(&model.User{}).Count(&totalUsers)

		// 计算新用户数量
		now := time.Now()
		today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
		weekStart := today.AddDate(0, 0, -7)
		monthStart := today.AddDate(0, -1, 0)

		var newUsersToday int64
		s.db.Model(&model.User{}).Where("created_at >= ?", today).Count(&newUsersToday)

		var newUsersThisWeek int64
		s.db.Model(&model.User{}).Where("created_at >= ?", weekStart).Count(&newUsersThisWeek)

		var newUsersThisMonth int64
		s.db.Model(&model.User{}).Where("created_at >= ?", monthStart).Count(&newUsersThisMonth)

		// 计算各角色用户数量
		usersByRole := make(map[model.UserRole]int64)
		rows, err := s.db.Model(&model.User{}).Select("role, COUNT(*) as count").Group("role").Rows()
		if err != nil {
			return nil, err
		}
		defer rows.Close()

		for rows.Next() {
			var role model.UserRole
			var count int64
			if err := rows.Scan(&role, &count); err != nil {
				return nil, err
			}
			usersByRole[role] = count
		}

		// 获取活跃评论者
		var topReviewers []cache.TopReviewer
		rows, err = s.db.Model(&model.Review{}).
			Select("user_id, COUNT(*) as review_count, AVG(rating) as avg_rating").
			Group("user_id").
			Order("review_count DESC").
			Limit(10).
			Rows()
		if err != nil {
			return nil, err
		}
		defer rows.Close()

		for rows.Next() {
			var reviewer cache.TopReviewer
			var userID string
			if err := rows.Scan(&userID, &reviewer.ReviewCount, &reviewer.AverageRating); err != nil {
				return nil, err
			}

			// 获取用户信息
			var user model.User
			if err := s.db.Select("name").First(&user, "id = ?", userID).Error; err != nil {
				return nil, err
			}
			reviewer.UserID = userID
			reviewer.Username = user.Name
			topReviewers = append(topReviewers, reviewer)
		}

		// 构建统计信息
		stats = &cache.UserStats{
			TotalUsers:        totalUsers,
			NewUsersToday:     newUsersToday,
			NewUsersThisWeek:  newUsersThisWeek,
			NewUsersThisMonth: newUsersThisMonth,
			UsersByRole:       usersByRole,
			TopReviewers:      topReviewers,
		}

		// 缓存统计信息
		if err := s.cache.SetUserStats(c, stats); err != nil {
			return nil, err
		}
	}

	return stats, nil
}

// GetProductStats 获取产品统计数据
func (s *StatsService) GetProductStats(c *gin.Context) (*cache.ProductStats, error) {
	// 尝试从缓存获取
	stats, err := s.cache.GetProductStats(c)
	if err != nil {
		return nil, err
	}

	if stats == nil {
		// 从数据库计算统计信息
		var totalProducts int64
		s.db.Model(&model.Product{}).Count(&totalProducts)

		// 计算各类型产品数量
		productsByType := make(map[string]int64)
		rows, err := s.db.Model(&model.Product{}).
			Select("product_type_id, COUNT(*) as count").
			Group("product_type_id").
			Rows()
		if err != nil {
			return nil, err
		}
		defer rows.Close()

		for rows.Next() {
			var typeID string
			var count int64
			if err := rows.Scan(&typeID, &count); err != nil {
				return nil, err
			}
			productsByType[typeID] = count
		}

		// 计算各用途产品数量
		productsByUtility := make(map[string]int64)
		rows, err = s.db.Model(&model.Product{}).
			Select("utility_type_id, COUNT(*) as count").
			Group("utility_type_id").
			Rows()
		if err != nil {
			return nil, err
		}
		defer rows.Close()

		for rows.Next() {
			var utilityID string
			var count int64
			if err := rows.Scan(&utilityID, &count); err != nil {
				return nil, err
			}
			productsByUtility[utilityID] = count
		}

		// 获取评分最高的产品
		var topRatedProducts []cache.TopRatedProduct
		rows, err = s.db.Model(&model.Review{}).
			Select("product_id, AVG(rating) as avg_rating, COUNT(*) as review_count").
			Group("product_id").
			Having("COUNT(*) >= ?", 5). // 至少有5条评论
			Order("avg_rating DESC").
			Limit(10).
			Rows()
		if err != nil {
			return nil, err
		}
		defer rows.Close()

		for rows.Next() {
			var product cache.TopRatedProduct
			var productID uint
			if err := rows.Scan(&productID, &product.AverageRating, &product.ReviewCount); err != nil {
				return nil, err
			}

			// 获取产品信息
			var p model.Product
			if err := s.db.Select("name").First(&p, "id = ?", productID).Error; err != nil {
				return nil, err
			}
			product.ProductID = productID
			product.Name = p.Name
			topRatedProducts = append(topRatedProducts, product)
		}

		// 获取评论最多的产品
		var mostReviewedProducts []cache.MostReviewedProduct
		rows, err = s.db.Model(&model.Review{}).
			Select("product_id, COUNT(*) as review_count, AVG(rating) as avg_rating").
			Group("product_id").
			Order("review_count DESC").
			Limit(10).
			Rows()
		if err != nil {
			return nil, err
		}
		defer rows.Close()

		for rows.Next() {
			var product cache.MostReviewedProduct
			var productID uint
			if err := rows.Scan(&productID, &product.ReviewCount, &product.AverageRating); err != nil {
				return nil, err
			}

			// 获取产品信息
			var p model.Product
			if err := s.db.Select("name").First(&p, "id = ?", productID).Error; err != nil {
				return nil, err
			}
			product.ProductID = productID
			product.Name = p.Name
			mostReviewedProducts = append(mostReviewedProducts, product)
		}

		// 构建统计信息
		stats = &cache.ProductStats{
			TotalProducts:        totalProducts,
			ProductsByType:       productsByType,
			ProductsByUtility:    productsByUtility,
			TopRatedProducts:     topRatedProducts,
			MostReviewedProducts: mostReviewedProducts,
		}

		// 缓存统计信息
		if err := s.cache.SetProductStats(c, stats); err != nil {
			return nil, err
		}
	}

	return stats, nil
}

// GetRatingStats 获取产品评分统计数据
func (s *StatsService) GetRatingStats(c *gin.Context, productID uint) (*cache.RatingStats, error) {
	// 尝试从缓存获取
	if stats, err := s.cache.GetRatingStats(c, productID); err == nil && stats != nil {
		return stats, nil
	}

	var stats cache.RatingStats
	stats.ProductID = productID

	// 获取产品名称
	var product model.Product
	if err := s.db.First(&product, "id = ?", productID).Error; err != nil {
		return nil, err
	}
	stats.ProductName = product.Name

	// 获取评分统计
	row := s.db.Raw(`
		SELECT 
			AVG(CAST(rating AS FLOAT)) as average_rating,
			COUNT(*) as total_ratings
		FROM reviews
		WHERE product_id = ?
	`, productID).Row()
	row.Scan(&stats.AverageRating, &stats.TotalRatings)

	// 获取各评分数量
	stats.RatingCounts = make(map[int]int64)
	rows, err := s.db.Raw(`
		SELECT rating, COUNT(*) as count
		FROM reviews
		WHERE product_id = ?
		GROUP BY rating
	`, productID).Rows()
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var rating int
			var count int64
			rows.Scan(&rating, &count)
			stats.RatingCounts[rating] = count
		}
	}

	// 获取最近的评论
	stats.RecentReviews = make([]cache.RecentReview, 0)
	rows, err = s.db.Raw(`
		SELECT 
			r.id,
			r.user_id,
			u.username,
			r.rating,
			r.comment,
			r.created_at
		FROM reviews r
		JOIN users u ON r.user_id = u.id
		WHERE r.product_id = ?
		ORDER BY r.created_at DESC
		LIMIT 10
	`, productID).Rows()
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var review cache.RecentReview
			rows.Scan(&review.ReviewID, &review.UserID, &review.Username,
				&review.Rating, &review.Comment, &review.CreatedAt)
			stats.RecentReviews = append(stats.RecentReviews, review)
		}
	}

	// 设置缓存
	s.cache.SetRatingStats(c, productID, &stats)

	return &stats, nil
}
