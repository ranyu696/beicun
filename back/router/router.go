package router

import (
	"beicun/back/config"
	"beicun/back/handler"
	"beicun/back/middleware"
	"beicun/back/service"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// SetupRouter 设置路由
func SetupRouter(
	authHandler *handler.AuthHandler,
	userHandler *handler.UserHandler,
	productHandler *handler.ProductHandler,
	reviewHandler *handler.ReviewHandler,
	brandHandler *handler.BrandHandler,
	commentHandler *handler.CommentHandler,
	utilityTypeHandler *handler.TypeHandler,
	productTypeHandler *handler.TypeHandler,
	channelTypeHandler *handler.TypeHandler,
	materialTypeHandler *handler.TypeHandler,
	statsHandler *handler.StatsHandler,
	searchHandler *handler.SearchHandler,
	storageHandler *handler.StorageHandler,
	uploadHandler *handler.UploadHandler,
	authService *service.AuthService,
	jwtSecret string,
	cfg *config.Config,
) *gin.Engine {
	r := gin.Default()

	// 全局中间件
	r.Use(middleware.CORSMiddleware())

	// 创建认证中间件
	authMiddleware := middleware.NewAuthMiddleware(authService, jwtSecret)

	// 如果是调试模式，启用Swagger
	if cfg.Server.Mode == "debug" {
		r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	}

	// API 路由组
	api := r.Group("/api")

	// 公开路由
	{
		// 认证相关
		auth := api.Group("/auth")
		{
			auth.POST("/login", authHandler.Login)           // 用户登录
			auth.POST("/register", authHandler.Register)     // 用户注册
			auth.POST("/refresh", authHandler.RefreshToken)  // 刷新令牌
			auth.POST("/reset-password", authHandler.ResetPassword) // 重置密码
			auth.POST("/code", authHandler.GenerateCaptcha) // 发送验证码
		}

		// 公开的产品相关路由
		products := api.Group("/products")
		{
			products.GET("", productHandler.ListProducts)     // 获取产品列表
			products.GET("/:id", productHandler.GetProduct)   // ID获取产品详情
			products.GET("/slug/:slug", productHandler.GetProductBySlug) // Slug获取产品详情
			products.GET("/:id/reviews", reviewHandler.ListProductReviews) // 获取产品测评

		}

		// 公开的材料类型相关路由
		materialTypes := api.Group("/material-types")
		{
			materialTypes.GET("", materialTypeHandler.ListTypes)           // 获取材料类型列表
			materialTypes.GET("/:id", materialTypeHandler.GetType)         // 获取材料类型详情
		}

		// 公开的产品类型相关路由
		productTypes := api.Group("/product-types")
		{
			productTypes.GET("", productTypeHandler.ListTypes)             // 获取产品类型列表
			productTypes.GET("/:id", productTypeHandler.GetType)           // 获取产品类型详情
		}

		// 公开的通道类型相关路由
		channelTypes := api.Group("/channel-types")
		{
			channelTypes.GET("", channelTypeHandler.ListTypes)             // 获取通道类型列表
			channelTypes.GET("/:id", channelTypeHandler.GetType)           // 获取通道类型详情
		}

		// 公开的器具类型相关路由
		utilityTypes := api.Group("/utility-types")
		{
			utilityTypes.GET("", utilityTypeHandler.ListTypes)             // 获取器具类型列表
			utilityTypes.GET("/:id", utilityTypeHandler.GetType)           // 获取器具类型详情
		}

		// 公开的测评相关路由
		reviews := api.Group("/reviews")
		{
			reviews.GET("", reviewHandler.ListReviews)                    // 获取测评列表
			reviews.GET("/:id", reviewHandler.GetReview)                 // 获取单个测评
			reviews.GET("/slug/:slug", reviewHandler.GetReviewBySlug)    // 获取单个测评
			reviews.GET("/slug/:slug/product", reviewHandler.GetProductByReviewSlug)    // 获取产品详情
		}
       //公开的评论
		comments := api.Group("/comments")
		{
			comments.GET("", commentHandler.ListComments)                    // 获取评论列表
		}
		// 公开的品牌相关路由
		brands := api.Group("/brands")
		{
			brands.GET("", brandHandler.ListBrands)                       // 获取品牌列表
			brands.GET("/:id", brandHandler.GetBrand)                     // 获取单个品牌
			brands.GET("/slug/:slug", brandHandler.GetBrandBySlug)        // 获取单个品牌
			brands.GET("/slug/:slug/products", brandHandler.GetBrandProducts)        // 获取单个品牌的产品列表
		}

		// 公开的搜索相关路由
		search := api.Group("/search")
		{
			search.GET("/products", searchHandler.SearchProducts)         // 搜索产品
			search.GET("/reviews", searchHandler.SearchReviews)           // 搜索测评
			search.GET("/brands", searchHandler.SearchBrands)             // 搜索品牌
		}


	}

	// 需要认证的路由
	authorized := api.Group("")
	authorized.Use(authMiddleware.RequireAuth())
	{
		// 用户相关
		user := authorized.Group("/user")
		{
			user.GET("/profile", userHandler.GetCurrentUser)         // 获取个人信息
			user.PUT("/profile", userHandler.UpdateCurrentUser)      // 更新个人信息
			user.POST("/change-password", authHandler.ChangePassword) // 修改密码
			user.GET("/me/reviews", userHandler.ListCurrentUserReviews) // 获取当前用户测评
			user.GET("/me/favorites", userHandler.ListCurrentUserFavorites) // 获取收藏列表
			user.POST("/me/favorites/:productId", userHandler.AddToFavorites) // 添加收藏
			user.DELETE("/me/favorites/:productId", userHandler.RemoveFromFavorites) // 取消收藏
		}

		// 用户管理（需要管理员权限）
		users := authorized.Group("/users")
		{
			users.GET("", authMiddleware.RequireAdmin(),  userHandler.ListUsers)            // 获取用户列表
			users.GET("/:id", authMiddleware.RequireAdmin(), userHandler.GetUser)          // 获取用户信息
			users.PUT("/:id", authMiddleware.RequireAdmin(), userHandler.UpdateUser)       // 更新用户
			users.DELETE("/:id", authMiddleware.RequireAdmin(), userHandler.DeleteUser)    // 删除用户
			users.POST("/:id/reset-password", authMiddleware.RequireAdmin(), authHandler.ResetPassword) // 重置密码
		}

		// 产品管理
		products := authorized.Group("/products")
		{
			products.POST("", authMiddleware.RequireAdmin(),  productHandler.CreateProduct)     // 创建产品
			products.PUT("/:id", authMiddleware.RequireAdmin(), productHandler.UpdateProduct)  // 更新产品
			products.DELETE("/:id", authMiddleware.RequireAdmin(), productHandler.DeleteProduct) // 删除产品
		}
		// 测评管理
		reviews := authorized.Group("/reviews")
		{
			reviews.POST("", authMiddleware.RequireAdmin(),  reviewHandler.CreateReview)        // 创建测评
			reviews.PUT("/:id", authMiddleware.RequireAdmin(), reviewHandler.UpdateReview)     // 更新测评
			reviews.DELETE("/:id", authMiddleware.RequireAdmin(), reviewHandler.DeleteReview)  // 删除测评
		}

		// 品牌管理
		brands := authorized.Group("/brands")
		{
			brands.POST("", authMiddleware.RequireAdmin(),  brandHandler.CreateBrand)        // 创建品牌
			brands.PUT("/:id", authMiddleware.RequireAdmin(), brandHandler.UpdateBrand)     // 更新品牌
			brands.DELETE("/:id", authMiddleware.RequireAdmin(), brandHandler.DeleteBrand)  // 删除品牌
		}

		// 类型相关路由
		utilityType := authorized.Group("/utility-types")
		{

	        utilityType.POST("", authMiddleware.RequireAdmin(),  utilityTypeHandler.CreateType)      // 创建器具类型 
			utilityType.PUT("/:id",authMiddleware.RequireAdmin(), utilityTypeHandler.UpdateType)   // 更新器具类型
			utilityType.DELETE("/:id", authMiddleware.RequireAdmin(), utilityTypeHandler.DeleteType) // 删除器具类型

		}

		productType := authorized.Group("/product-types")
		{

				productType.POST("", authMiddleware.RequireAdmin(),  productTypeHandler.CreateType)      // 创建产品类型
				productType.PUT("/:id", authMiddleware.RequireAdmin(), productTypeHandler.UpdateType)   // 更新产品类型
				productType.DELETE("/:id", authMiddleware.RequireAdmin(), productTypeHandler.DeleteType) // 删除产品类型
		}

		channelType :=  authorized.Group("/channel-types")
		{

				channelType.POST("", authMiddleware.RequireAdmin(),  channelTypeHandler.CreateType)      // 创建通道类型 
				channelType.PUT("/:id",authMiddleware.RequireAdmin(), channelTypeHandler.UpdateType)   // 更新通道类型
				channelType.DELETE("/:id", authMiddleware.RequireAdmin(), channelTypeHandler.DeleteType) // 删除通道类型

		}

		materialType := authorized.Group("/material-types") 
		materialType.POST("", authMiddleware.RequireAdmin(),  materialTypeHandler.CreateType)      // 创建材料类型
		materialType.PUT("/:id",authMiddleware.RequireAdmin(), materialTypeHandler.UpdateType)   // 更新材料类型
		materialType.DELETE("/:id", authMiddleware.RequireAdmin(), materialTypeHandler.DeleteType) // 删除材料类型

		// 评论相关路由
		comments := authorized.Group("/comments")
		{
			comments.POST("", commentHandler.CreateComment)                                             // 创建评论
			comments.PUT("/:id", commentHandler.UpdateComment)                                         // 更新评论
			comments.DELETE("/:id", commentHandler.DeleteComment)                                      // 删除评论
			comments.GET("/:id", commentHandler.GetComment)                                            // 获取评论详情
			comments.GET("/all", authMiddleware.RequireAdmin(),commentHandler.ListAllComments)                                              // 获取评论列表
			comments.PUT("/:id/status", authMiddleware.RequireAdmin(), commentHandler.UpdateCommentStatus) // 更新评论状态
		}

		// 管理员评论路由
		admin := authorized.Group("/admin")
		admin.Use(authMiddleware.RequireAdmin())
		{
			adminComments := admin.Group("/comments")
			{
				adminComments.GET("", commentHandler.ListAllComments) // 获取所有评论列表
			}
		}

		// 统计相关路由
		stats := authorized.Group("/stats")
		{
			stats.GET("/users", statsHandler.GetUserStats)           // 用户统计
			stats.GET("/products", statsHandler.GetProductStats)     // 产品统计
			stats.GET("/products/:id/ratings", statsHandler.GetRatingStats) // 产品评分统计
		}

		// 管理员统计路由
		adminStats := admin.Group("/stats")
		{
			adminStats.GET("/dashboard", statsHandler.GetDashboardStats) // 仪表盘统计
		}

		// 搜索路由
		search := authorized.Group("/search")
		{
			search.GET("/users", authMiddleware.RequireAdmin(),  searchHandler.SearchUsers)     // 搜索用户（管理员）
		}

		// 文件存储路由
		storage := authorized.Group("")
		{
			// 文件夹管理
			folders := storage.Group("/folders")
			{
				folders.POST("", authMiddleware.RequireAdmin(),  storageHandler.CreateFolder)                    // 创建文件夹
				folders.GET("", authMiddleware.RequireAdmin(), storageHandler.ListFolders)                      // 获取文件夹列表
				folders.GET("/:id", authMiddleware.RequireAdmin(), storageHandler.GetFolder)                    // 获取文件夹详情
				folders.PATCH("/:id", authMiddleware.RequireAdmin(), storageHandler.UpdateFolder)               // 更新文件夹
				folders.DELETE("/:id", authMiddleware.RequireAdmin(), storageHandler.DeleteFolder)              // 删除文件夹
				folders.POST("/:id/move", authMiddleware.RequireAdmin(), storageHandler.MoveFolder)             // 移动文件夹
			}

			// 文件管理
			files := storage.Group("/files")
			{
				// 文件上传
				// 图片上传
				upload := files.Group("upload")
				{
					upload.POST("/check", authMiddleware.RequireAdmin(), uploadHandler.CheckUpload)          // 检查文件上传状态
					upload.POST("/init", authMiddleware.RequireAdmin(), uploadHandler.InitUpload)           // 初始化上传
					upload.POST("/chunk", authMiddleware.RequireAdmin(), uploadHandler.UploadChunk)          // 上传文件分片
					upload.GET("/progress", authMiddleware.RequireAdmin(), uploadHandler.GetUploadProgress) // 获取上传进度
					upload.POST("/images", authMiddleware.RequireAdmin(), uploadHandler.BatchUploadImages)   // 批量上传图片
				}

				// 文件管理
				files.GET("", authMiddleware.RequireAdmin(), storageHandler.ListFiles)                            // 获取文件列表
				files.GET("/:id", authMiddleware.RequireAdmin(), storageHandler.GetFile)                          // 获取文件详情
				files.DELETE("/:id", authMiddleware.RequireAdmin(), storageHandler.DeleteFile)                    // 删除文件
				files.POST("/:id/move", authMiddleware.RequireAdmin(), storageHandler.MoveFile)                   // 移动文件
			}

			// 存储统计
			storage.GET("/storage/stats", authMiddleware.RequireAdmin(), storageHandler.GetStorageStats)        // 获取存储统计信息
		}
	}

	return r
}
