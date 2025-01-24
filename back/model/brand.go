package model

import (
	"time"

)

// Brand 品牌
type Brand struct {
	ID          string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`            // 品牌ID
	Slug        string    `gorm:"type:varchar(50);not null;uniqueIndex" json:"slug"`                    // 品牌Slug
	Name        string    `gorm:"type:varchar(50);not null;uniqueIndex" json:"name"`                    // 品牌名称
	Description string    `gorm:"type:text" json:"description"`                                         // 品牌描述
	Website     *string   `gorm:"type:varchar(255)" json:"website,omitempty"`                           // 品牌网站
	Logo        string    `gorm:"type:varchar(255)" json:"logo"`                                        // 品牌LOGO
	SortOrder   int       `gorm:"default:0;index" json:"sortOrder"`                                     // 排序顺序
	CreatedAt   time.Time `gorm:"not null" json:"createdAt"`                                           // 创建时间
	UpdatedAt   time.Time `gorm:"not null" json:"updatedAt"`                                           // 更新时间

	Products []Product `gorm:"foreignKey:BrandID;constraint:OnDelete:RESTRICT" json:"products,omitempty"` // 关联的产品
}
