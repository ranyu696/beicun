package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"beicun/back/cache"
	"beicun/back/config"
	"beicun/back/database"
	"beicun/back/handler"
	"beicun/back/router"
	"beicun/back/service"
)

func main() {
	// 加载配置
	cfg, err := config.LoadConfig("config/config.yaml")
	if err != nil {
		log.Fatalf("加载配置失败: %v", err)
	}

	// 初始化日志配置
	logConfig := zap.NewDevelopmentConfig()
	logConfig.Level = zap.NewAtomicLevelAt(zap.DebugLevel)
	logConfig.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	logConfig.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	logConfig.OutputPaths = []string{"stdout", "logs/app.log"}
	logConfig.ErrorOutputPaths = []string{"stderr", "logs/error.log"}

	logger, err := logConfig.Build()
	if err != nil {
		log.Fatal("初始化日志失败:", err)
	}
	defer logger.Sync()

	zap.ReplaceGlobals(logger)

	// 设置运行模式
	switch cfg.Server.Mode {
	case "release":
		gin.SetMode(gin.ReleaseMode)
	case "debug":
		gin.SetMode(gin.DebugMode)
	default:
		gin.SetMode(gin.DebugMode)
		log.Printf("未知模式: %s, 默认使用调试模式", cfg.Server.Mode)
	}

	// 初始化数据库和Redis
	if err := database.InitDB(cfg); err != nil {
		log.Fatal("初始化数据库失败:", err)
	}

	// 获取数据库和Redis连接
	db := database.GetDB()
	redisClient := database.GetRedis()

	// 初始化缓存
	cacheClient := cache.NewRedisCache()

	// 初始化服务
	emailService := service.NewEmailService(cfg)
	captchaService := service.NewCaptchaService(emailService, redisClient)
	userService := service.NewUserService(db)
	authService := service.NewAuthService(userService, captchaService, cfg)
	productService := service.NewProductService(db)
	reviewService := service.NewReviewService(db, productService)
	brandService := service.NewBrandService(db)
	commentService := service.NewCommentService(db)
	utilityTypeService := service.NewUtilityTypeService(db)
	productTypeService := service.NewProductTypeService(db)
	channelTypeService := service.NewChannelTypeService(db)
	materialTypeService := service.NewMaterialTypeService(db)
	statsService := service.NewStatsService(db, cacheClient)
	searchService := service.NewSearchService(db)
	storageService := service.NewStorageService(db, cfg, redisClient, zap.L())
	
	uploadService := service.NewUploadService(db, zap.L(), &cfg.Storage)

	// 初始化处理器
	authHandler := handler.NewAuthHandler(authService, captchaService)
	userHandler := handler.NewUserHandler(userService)
	productHandler := handler.NewProductHandler(productService)
	reviewHandler := handler.NewReviewHandler(reviewService)
	brandHandler := handler.NewBrandHandler(brandService)
	commentHandler := handler.NewCommentHandler(commentService)
	utilityTypeHandler := handler.NewUtilityTypeHandler(utilityTypeService)
	productTypeHandler := handler.NewProductTypeHandler(productTypeService)
	channelTypeHandler := handler.NewChannelTypeHandler(channelTypeService)
	materialTypeHandler := handler.NewMaterialTypeHandler(materialTypeService)
	statsHandler := handler.NewStatsHandler(statsService)
	searchHandler := handler.NewSearchHandler(searchService)
	storageHandler := handler.NewStorageHandler(storageService, cfg) 
	uploadHandler := handler.NewUploadHandler(uploadService, zap.L())

	// 设置路由
	r := router.SetupRouter(
		authHandler,
		userHandler,
		productHandler,
		reviewHandler,
		brandHandler,
		commentHandler,
		utilityTypeHandler,
		productTypeHandler,
		channelTypeHandler,
		materialTypeHandler,
		statsHandler,
		searchHandler,
		storageHandler,
		uploadHandler,
		authService,
		cfg.JWT.Secret,
		cfg,
	)

	// 设置受信任的代理
	if err := r.SetTrustedProxies([]string{"127.0.0.1"}); err != nil {
		log.Printf("设置受信任代理失败: %v", err)
	}

	// 配置前端文件服务
	frontendDir := "./web/dist"

	// 配置静态文件服务
	r.Static("/storage", "./storage/upload")

	if cfg.Server.Mode == "release" {
		// 生产环境：服务打包后的静态文件
		r.Static("/assets", filepath.Join(frontendDir, "assets"))
		r.StaticFile("/favicon.ico", filepath.Join(frontendDir, "favicon.ico"))

		// 处理前端路由
		r.NoRoute(func(c *gin.Context) {
			// 如果是API请求，返回404
			if strings.HasPrefix(c.Request.URL.Path, "/api/") {
				c.JSON(http.StatusNotFound, gin.H{"error": "API not found"})
				return
			}

			// 检查请求的文件是否存在
			path := filepath.Join(frontendDir, c.Request.URL.Path)
			if _, err := os.Stat(path); err == nil {
				// 文件存在，直接提供服务
				c.File(path)
				return
			}

			// 所有其他请求返回index.html（支持前端路由）
			c.File(filepath.Join(frontendDir, "index.html"))
		})
	} else {
		// 开发环境：将非API请求代理到Vite开发服务器
		r.NoRoute(func(c *gin.Context) {
			// 排除 API 和 storage 路径
			if strings.HasPrefix(c.Request.URL.Path, "/api/") {
				c.JSON(http.StatusNotFound, gin.H{"error": "API not found"})
				return
			}

			if strings.HasPrefix(c.Request.URL.Path, "/storage/") {
				c.File(filepath.Join(".", c.Request.URL.Path))
				return
			}

			// 在开发模式下，所有其他请求都转发到Vite开发服务器
			proxy := &httputil.ReverseProxy{
				Director: func(req *http.Request) {
					req.URL.Scheme = "http"
					req.URL.Host = "localhost:5173"
					req.Host = "localhost:5173"

					// 保留原始路径
					if req.URL.Path == "/" {
						req.URL.Path = "/index.html"
					}

					// 处理 WebSocket 升级
					if strings.Contains(req.Header.Get("Connection"), "Upgrade") &&
						strings.Contains(req.Header.Get("Upgrade"), "websocket") {
						req.URL.Scheme = "ws"
					}
				},
				ModifyResponse: func(res *http.Response) error {
					// 添加 CORS 头
					res.Header.Set("Access-Control-Allow-Origin", "*")
					res.Header.Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
					res.Header.Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, Authorization")
					res.Header.Set("Access-Control-Allow-Credentials", "true")
					return nil
				},
			}

			// 处理 WebSocket
			if strings.Contains(c.Request.Header.Get("Connection"), "Upgrade") &&
				strings.Contains(c.Request.Header.Get("Upgrade"), "websocket") {
				proxy.ServeHTTP(c.Writer, c.Request)
				return
			}

			// 处理普通 HTTP 请求
			proxy.ServeHTTP(c.Writer, c.Request)
		})
	}

	// 启动服务器
	port := strconv.Itoa(cfg.Server.Port)
	if port == "0" {
		port = "8080"
	}
	log.Printf("服务器在 %s 模式下运行，端口: %s", cfg.Server.Mode, port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("启动服务器失败: %v", err)
	}
}
