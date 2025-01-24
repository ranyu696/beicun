package database

import (
	"beicun/back/model"
	"github.com/gosimple/slug"
	"gorm.io/gorm"
)

// RunMigrations 运行数据库迁移
func RunMigrations(db *gorm.DB) error {
	// 1. 先添加 slug 字段，允许为空
	if err := db.Exec(`ALTER TABLE brands ADD COLUMN IF NOT EXISTS slug varchar(50)`).Error; err != nil {
		return err
	}

	// 2. 更新现有记录的 slug
	var brands []model.Brand
	if err := db.Find(&brands).Error; err != nil {
		return err
	}

	for _, brand := range brands {
		if brand.Slug == "" {
			// 生成 slug
			brandSlug := slug.Make(brand.Name)
			
			// 检查 slug 是否已存在
			var count int64
			db.Model(&model.Brand{}).Where("slug = ? AND id != ?", brandSlug, brand.ID).Count(&count)
			
			// 如果存在，添加数字后缀
			counter := 1
			finalSlug := brandSlug
			for count > 0 {
				finalSlug = slug.Make(brandSlug + "-" + string(counter))
				db.Model(&model.Brand{}).Where("slug = ? AND id != ?", finalSlug, brand.ID).Count(&count)
				counter++
			}

			// 更新记录
			if err := db.Model(&brand).Update("slug", finalSlug).Error; err != nil {
				return err
			}
		}
	}

	// 3. 添加非空和唯一约束
	if err := db.Exec(`ALTER TABLE brands ALTER COLUMN slug SET NOT NULL`).Error; err != nil {
		return err
	}
	if err := db.Exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug)`).Error; err != nil {
		return err
	}

	return nil
}
