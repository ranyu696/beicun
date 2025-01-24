package database

import (
	"beicun/back/model"
	"beicun/back/utils"
	"log"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// SeedData 初始化数据库种子数据
func SeedData(db *gorm.DB) error {
	// 检查是否已经有管理员用户
	var count int64
	if err := db.Model(&model.User{}).Where("role = ?", model.UserRoleAdmin).Count(&count).Error; err != nil {
		return err
	}

	// 如果已经有管理员用户，则跳过
	if count > 0 {
		log.Println("管理员用户已存在，跳过种子数据初始化")
		return nil
	}

	// 开始事务
	return db.Transaction(func(tx *gorm.DB) error {
		// 1. 创建管理员用户
		adminPassword := "admin123" // 在生产环境中应该使用更强的密码
		adminSalt := utils.GenerateRandomString(32)
		adminHashedPassword, err := bcrypt.GenerateFromPassword([]byte(adminPassword+adminSalt), bcrypt.DefaultCost)
		if err != nil {
			return err
		}

		admin := &model.User{
			Name:            "Admin",
			Email:           "admin@example.com",
			Password:        string(adminHashedPassword),
			Salt:           adminSalt,
			IsEmailVerified: true,
			Role:           model.UserRoleAdmin,
			Status:         model.UserStatusActive,
			LastLoginAt:    nil,
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		}

		if err := tx.Create(admin).Error; err != nil {
			return err
		}

		// 2. 创建编辑员用户
		editorPassword := "editor123"
		editorSalt := utils.GenerateRandomString(32)
		editorHashedPassword, err := bcrypt.GenerateFromPassword([]byte(editorPassword+editorSalt), bcrypt.DefaultCost)
		if err != nil {
			return err
		}

		editor := &model.User{
			Name:            "Editor",
			Email:           "editor@example.com",
			Password:        string(editorHashedPassword),
			Salt:           editorSalt,
			IsEmailVerified: true,
			Role:           model.UserRoleEditor,
			Status:         model.UserStatusActive,
			LastLoginAt:    nil,
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		}

		if err := tx.Create(editor).Error; err != nil {
			return err
		}

		// 3. 创建根目录
		rootFolder := &model.Folder{
			Name:        "Root",
			Path:        "/",
			Description: utils.StringPtr("根目录"),
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}
		if err := tx.Create(rootFolder).Error; err != nil {
			return err
		}

		// 4. 创建子文件夹
		subFolders := []model.Folder{
			{
				Name:        "Avatars",
				Path:        "/Root/avatars",
				Description: utils.StringPtr("用户头像"),
				ParentID:    &rootFolder.ID,
			},
			{
				Name:        "Brands",
				Path:        "/Root/brands",
				Description: utils.StringPtr("品牌Logo"),
				ParentID:    &rootFolder.ID,
			},
			{
				Name:        "Products",
				Path:        "/Root/products",
				Description: utils.StringPtr("产品图片"),
				ParentID:    &rootFolder.ID,
			},
			{
				Name:        "Reviews",
				Path:        "/Root/reviews",
				Description: utils.StringPtr("测评内容"),
				ParentID:    &rootFolder.ID,
			},
		}

		// 创建子文件夹
		for i := range subFolders {
			subFolders[i].CreatedAt = time.Now()
			subFolders[i].UpdatedAt = time.Now()
			if err := tx.Create(&subFolders[i]).Error; err != nil {
				return err
			}
		}

		log.Println("初始用户创建成功：")
		log.Println("管理员 - Email: admin@example.com, 密码: admin123")
		log.Println("编辑员 - Email: editor@example.com, 密码: editor123")
		return nil
	})
}

// CleanData 清理数据库数据（仅用于测试环境）
func CleanData(db *gorm.DB) error {
	// 在测试环境中使用，清理所有表数据
	if err := db.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&model.User{}).Error; err != nil {
		return err
	}
	return nil
}
