package model

import (
	"time"
	"gorm.io/gorm"
)



// User 用户模型
type User struct {
	ID                string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`              // 用户ID
	Name              string    `gorm:"type:varchar(50);not null" json:"name"`                                 // 用户名称
	Email             string    `gorm:"type:varchar(255);not null;uniqueIndex" json:"email"`                   // 用户邮箱
	Password          string   `gorm:"type:varchar(255)" json:"-"`                                            // 用户密码
	Salt              string   `gorm:"type:varchar(255)" json:"-"`                                            // 用户密码盐
	IsEmailVerified   bool      `gorm:"default:false;index" json:"isEmailVerified"`                            // 邮箱是否已验证
	Role              UserRole  `gorm:"type:varchar(20);default:'USER';index" json:"role"`                     // 用户角色
	Avatar            string   `gorm:"type:varchar(255)" json:"avatar,omitempty"`                             // 用户头像
	Bio               string   `gorm:"type:text" json:"bio,omitempty"`                                        // 用户简介
	LastLoginAt      *time.Time `gorm:"index" json:"lastLoginAt,omitempty"`                                    // 最后登录时间
	CreatedAt        time.Time  `gorm:"not null" json:"createdAt"`                                            // 创建时间
	UpdatedAt        time.Time  `gorm:"not null" json:"updatedAt"`                                            // 更新时间
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`                                                    // 软删除
	Status           UserStatus `gorm:"type:varchar(20);default:'active'" json:"status"`                       // 用户状态

	// 关联
	Products  []Product       `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"products,omitempty"`   // 用户的产品
	Ratings   []Rating `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"ratings,omitempty"`   // 用户的评分
	Reviews   []Review        `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"reviews,omitempty"`   // 用户的测评
	Comments  []Comment       `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"comments,omitempty"`  // 用户的评论
	Favorites []UserFavorite  `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"favorites,omitempty"` // 用户的收藏
}

// UserFavorite 用户收藏
type UserFavorite struct {
	UserID    string    `gorm:"type:uuid;not null;primaryKey" json:"userId"`
	ProductID string    `gorm:"type:uuid;not null;primaryKey" json:"productId"`
	CreatedAt time.Time `gorm:"not null" json:"createdAt"`

	User    User    `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
	Product Product `gorm:"foreignKey:ProductID;references:ID;constraint:OnDelete:CASCADE" json:"product,omitempty"`
}
