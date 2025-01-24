package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"beicun/back/config"
	"beicun/back/model"
)

var (
	DB    *gorm.DB
	Redis *redis.Client
)

// InitDB 
func InitDB(cfg *config.Config) error {
	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
		logger.Config{
			SlowThreshold:             time.Second,  // 慢 SQL 阈值
			LogLevel:                  logger.Info,  // 日志级别
			IgnoreRecordNotFoundError: true,        // 忽略ErrRecordNotFound（记录未找到）错误
			Colorful:                  true,         // 禁用彩色打印
		},
	)

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=disable TimeZone=Asia/Shanghai",
		cfg.Database.Host,
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.DBName,
		cfg.Database.Port,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: newLogger,
	})
	if err != nil {
		return fmt.Errorf("无法连接到数据库: %w", err)
	}

	// 设置连接池
	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("无法获得sql.db: %w", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	DB = db

	// 自动迁移
	if err := autoMigrate(db); err != nil {
		return fmt.Errorf("自动迁移失败: %w", err)
	}
	if err := SeedData(db); err != nil {
		return fmt.Errorf("无法播种数据: %w", err)
	}
	// 
	Redis = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%d", cfg.Redis.Host, cfg.Redis.Port),
		Password: cfg.Redis.Password,
		DB:       cfg.Redis.DB,
	})

	// 
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// 
	if err := Redis.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("连接redis失败: %w", err)
	}

	log.Println("   ")
	return nil
}

// GetDB  
func GetDB() *gorm.DB {
	return DB
}

// GetRedis  
func GetRedis() *redis.Client {
	return Redis
}

// autoMigrate  
func autoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&model.User{},
		&model.UserFavorite{},
		&model.Brand{},
		&model.Product{},
		&model.Review{},
		&model.Rating{},
		&model.Tag{},
		&model.ProductTag{},
		&model.Comment{},
		&model.ProductType{},
		&model.ChannelType{},
		&model.MaterialType{},
		&model.UtilityType{},
		&model.File{},
		&model.Folder{},
		
	)
}
