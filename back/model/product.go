package model

import (
	"time"
	"github.com/lib/pq"
	"gorm.io/gorm"

	"encoding/json"
)

// Product 产品模型
type Product struct {
	ID               uint             `gorm:"primaryKey;autoIncrement" json:"id"` // 产品ID
	Name             string           `gorm:"type:varchar(255);not null" json:"name"`                     // 产品名称
	Slug             string           `gorm:"type:varchar(255);uniqueIndex" json:"slug"`                 // 没有重复
	RegistrationDate time.Time        `json:"registrationDate"`                                         // 注册日期
	Price            float64          `json:"price"`                                                    // 价格
	Height           float64          `json:"height"`                                                   // 高度
	Width            float64          `json:"width"`                                                    // 宽度
	Length           float64          `json:"length"`                                                   // 长度
	ChannelLength    float64          `json:"channelLength"`                                            // 通道长度
	TotalLength      float64          `json:"totalLength"`                                              // 总长度
	Weight           float64          `json:"weight"`                                                   // 重量
	Version          string           `gorm:"type:varchar(50)" json:"version"`                          // 版本
	IsReversible     bool             `json:"isReversible"`                                             // 是否可逆
	Stimulation      StimulationLevel `gorm:"type:varchar(20)" json:"stimulation"`                      // 刺激度
	Softness         SoftnessLevel    `gorm:"type:varchar(20)" json:"softness"`                         // 软度
	Tightness        TightnessLevel   `gorm:"type:varchar(20)" json:"tightness"`                        // 粗细
	Smell            Level            `gorm:"type:varchar(20)" json:"smell"`                            // 香味
	Oiliness         Level            `gorm:"type:varchar(20)" json:"oiliness"`                         // 出油量
	Durability       DurabilityLevel  `gorm:"type:varchar(20)" json:"durability"`                       // 耐用性
	Description      *string          `gorm:"type:text" json:"description,omitempty"`                   // 描述
	TaobaoUrl        *string          `gorm:"type:varchar(255)" json:"taobaoUrl,omitempty"`             // 淘宝链接
	MainImage        json.RawMessage  `gorm:"type:jsonb" json:"mainImage"`                             // 主图
	SalesImage       json.RawMessage  `gorm:"type:jsonb" json:"salesImage"`                            // 销售图
	ProductImages    json.RawMessage  `gorm:"type:jsonb" json:"productImages"`                         // 产品详情图
	VideoUrl         *string          `gorm:"type:varchar(255)" json:"videoUrl,omitempty"`              // 视频链接
	AverageRating    float64          `gorm:"type:decimal(3,2);default:0" json:"averageRating"`        // 平均评分
	TotalRatings     int              `gorm:"default:0" json:"totalRatings"`                           // 总评分
	ViewCount        int              `gorm:"default:0" json:"viewCount"`                              // 浏览量
	CreatedAt        time.Time        `gorm:"not null" json:"createdAt"`                               // 创建时间
	UpdatedAt        time.Time        `gorm:"not null" json:"updatedAt"`                               // 更新时间
	DeletedAt        gorm.DeletedAt   `gorm:"index" json:"-"`                                          // 软删除

	// 关联
	UserID         string       `gorm:"type:uuid;not null" json:"userId"`                              // 创建者ID
	User           User         `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"user"` // 创建者
	UtilityTypeID  string       `gorm:"type:uuid;not null" json:"utilityTypeId"`                       // 器具类型ID
	UtilityType    UtilityType  `gorm:"foreignKey:UtilityTypeID;references:ID;constraint:OnDelete:RESTRICT" json:"utilityType"` // 器具类型
	ProductTypeID  string       `gorm:"type:uuid;not null" json:"productTypeId"`                       // 产品类型ID
	ProductType    ProductType  `gorm:"foreignKey:ProductTypeID;references:ID;constraint:OnDelete:RESTRICT" json:"productType"` // 产品类型
	ChannelTypeID  string       `gorm:"type:uuid;not null" json:"channelTypeId"`                       // 通道类型ID
	ChannelType    ChannelType  `gorm:"foreignKey:ChannelTypeID;references:ID;constraint:OnDelete:RESTRICT" json:"channelType"` // 通道类型
	BrandID        string       `gorm:"type:uuid;not null" json:"brandId"`                             // 品牌ID
	Brand          Brand        `gorm:"foreignKey:BrandID;references:ID;constraint:OnDelete:RESTRICT" json:"brand"` // 品牌
	MaterialTypeID string       `gorm:"type:uuid;not null" json:"materialTypeId"`                      // 材料类型ID
	MaterialType   MaterialType `gorm:"foreignKey:MaterialTypeID;references:ID;constraint:OnDelete:RESTRICT" json:"materialType"` // 材料类型

	// 其他关联
	Ratings      []Rating `gorm:"foreignKey:ProductID;constraint:OnDelete:CASCADE" json:"ratings,omitempty"` // 产品评分
	Tags         []ProductTag    `gorm:"foreignKey:ProductID;constraint:OnDelete:CASCADE" json:"tags,omitempty"`
	Reviews      []Review        `gorm:"foreignKey:ProductID;constraint:OnDelete:CASCADE" json:"reviews,omitempty"` // 产品测评
}

// MainImage 主图
type MainImage struct {
	URL    string `json:"url"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
	Sort   int    `json:"sort"`
}

// SalesImage 销售图
type SalesImage struct {
	URL    string `json:"url"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
	Sort   int    `json:"sort"`
}

// ProductImage 产品详情图
type ProductImage struct {
	URL         string `json:"url"`
	Width       int    `json:"width"`
	Height      int    `json:"height"`
	Sort        int    `json:"sort"`
	Description string `json:"description"`
}

// ProductRating 产品评分
type Rating struct {
	ID        string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`              // 评分ID
	ProductID uint      `gorm:"index;not null" json:"productId"`                                        // 产品ID
	UserID    string    `gorm:"index;not null" json:"userId"`                                          // 用户ID
	Rating    float64   `gorm:"type:decimal(2,1);not null;check:rating >= 1 AND rating <= 5" json:"rating"` // 评分(1-5)
	Reason    *string   `gorm:"type:text" json:"reason,omitempty"`                                      // 评分理由
	CreatedAt time.Time `gorm:"not null" json:"createdAt"`                                             // 创建时间

	Product Product `gorm:"foreignKey:ProductID;references:ID;constraint:OnDelete:CASCADE" json:"-"`     // 关联产品
	User    User    `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"-"`       // 关联用户
}

// Review 测评
type Review struct {
	ID            string         `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`       // 测评ID
	Title         string         `gorm:"not null" json:"title"`                                          // 标题
	Cover         string         `gorm:"not null" json:"cover"`                                          // 封面
	Slug          string         `gorm:"index" json:"slug"`                                              // slug
	Status        ReviewStatus   `gorm:"type:varchar(20);default:'PENDING';index" json:"status"`          // 状态
	ProductID     uint           `gorm:"index;not null" json:"productId"`                                // 产品ID
	UserID        string         `gorm:"index;not null" json:"userId"`                                   // 用户ID
	Content       string         `gorm:"type:text;not null" json:"content"`                              // 内容
	Pros          pq.StringArray `gorm:"type:text[]" json:"pros"`                                        // 优点列表
	Cons          pq.StringArray `gorm:"type:text[]" json:"cons"`                                        // 缺点列表
	Conclusion    string         `gorm:"type:text" json:"conclusion"`                                    // 总结
	Views         int            `gorm:"default:0;index" json:"views"`                                   // 浏览量
	RatingCount   int            `gorm:"default:0;index" json:"ratingCount"`                             // 评论数量
	IsRecommended bool           `gorm:"default:false;index" json:"isRecommended"`                       // 是否推荐
	PublishedAt   *time.Time     `gorm:"index" json:"publishedAt,omitempty"`                            // 发布时间
	CreatedAt     time.Time      `gorm:"not null" json:"createdAt"`                                     // 创建时间
	UpdatedAt     time.Time      `gorm:"not null" json:"updatedAt"`                                     // 更新时间

	Product  *Product   `gorm:"foreignKey:ProductID;references:ID;constraint:OnDelete:CASCADE" json:"-"`  // 关联产品
	Author   User       `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"author"` // 作者
	Comments []Comment  `gorm:"foreignKey:ReviewID;constraint:OnDelete:CASCADE" json:"comments,omitempty"` // 评论列表
}

// Comment 评论
type Comment struct {
	ID        string        `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`          // 评论ID
	ReviewID  string        `gorm:"index;not null" json:"reviewId"`                                     // 测评ID
	UserID    string        `gorm:"index;not null" json:"userId"`                                       // 评论用户ID
	ParentID  *string       `gorm:"type:uuid;index" json:"parentId"`                                    // 父评论ID，为空表示顶级评论
	ReplyToID *string       `gorm:"type:uuid;index" json:"replyToId"`                                  // 回复用户ID，为空表示不是回复
	Content   string        `gorm:"type:text;not null" json:"content"`                                  // 评论内容
	Status    CommentStatus `gorm:"type:varchar(20);default:'PENDING';index" json:"status"`             // 状态
	Level     int          `gorm:"type:int;default:1;not null" json:"level"`                           // 评论层级，1为顶级评论
	CreatedAt time.Time     `gorm:"not null" json:"createdAt"`                                          // 创建时间
	UpdatedAt time.Time     `gorm:"not null" json:"updatedAt"`                                          // 更新时间

	Review   Review    `gorm:"foreignKey:ReviewID;references:ID;constraint:OnDelete:CASCADE" json:"-"`   // 关联测评
	User     User      `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"user"`  // 评论用户
	Parent   *Comment  `gorm:"foreignKey:ParentID;references:ID" json:"parent,omitempty"`               // 父评论
	ReplyTo  *User     `gorm:"foreignKey:ReplyToID;references:ID" json:"replyTo,omitempty"`            // 回复用户
	Replies  []Comment `gorm:"foreignKey:ParentID;references:ID" json:"replies,omitempty"`              // 子评论列表
}

// CommentResponse 评论响应结构
type CommentResponse struct {
	ID        string        `json:"id"`          // 评论ID
	ReviewID  string        `json:"reviewId"`     // 测评ID
	Content   string        `json:"content"`      // 评论内容
	Status    CommentStatus `json:"status"`       // 状态
	Level     int          `json:"level"`        // 评论层级
	CreatedAt time.Time     `json:"createdAt"`    // 创建时间
	UpdatedAt time.Time     `json:"updatedAt"`    // 更新时间
	
	User     *UserBrief     `json:"user"`         // 评论用户
	ReplyTo  *UserBrief     `json:"replyTo,omitempty"` // 回复用户
	Replies  []CommentResponse `json:"replies,omitempty"` // 子评论列表
}

// UserBrief 用户简要信息
type UserBrief struct {
	ID       string `json:"id"`       // 用户ID
	Name     string `json:"name"`     // 用户名
	Avatar   string `json:"avatar"`   // 头像
}

// Tag 标签
type Tag struct {
	ID        string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`              // 标签ID
	Slug      string    `gorm:"type:varchar(50);not null;uniqueIndex" json:"slug"`                      // 标签slug
	Name      string    `gorm:"type:varchar(50);not null;uniqueIndex" json:"name"`                      // 标签名称
	CreatedAt time.Time `gorm:"not null" json:"createdAt"`                                             // 创建时间
	UpdatedAt time.Time `gorm:"not null" json:"updatedAt"`                                             // 更新时间

	Products []Product `gorm:"many2many:product_tags" json:"products,omitempty"`                        // 关联产品
}

// ProductTag 产品标签关联
type ProductTag struct {
	ProductID  uint      `gorm:"primaryKey;not null" json:"productId"`                        // 产品ID
	TagID      string    `gorm:"primaryKey;not null" json:"tagId"`                           // 标签ID
	CreatedAt  time.Time `gorm:"not null" json:"createdAt"`                                            // 创建时间

	Product Product `gorm:"foreignKey:ProductID;references:ID;constraint:OnDelete:CASCADE" json:"-"`     // 关联产品
	Tag     Tag     `gorm:"foreignKey:TagID;references:ID;constraint:OnDelete:CASCADE" json:"-"`        // 关联标签
}

// UtilityType 器具类型
type UtilityType struct {
	ID          string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`            // 类型ID
	Name        string    `gorm:"type:varchar(50);not null;uniqueIndex" json:"name"`                    // 类型名称
	Description string    `gorm:"type:text" json:"description"`                                         // 类型描述
	SortOrder   int       `gorm:"default:0;index" json:"sortOrder"`                                     // 排序顺序
	CreatedAt   time.Time `gorm:"not null" json:"createdAt"`                                           // 创建时间
	UpdatedAt   time.Time `gorm:"not null" json:"updatedAt"`                                           // 更新时间

	Products []Product `gorm:"foreignKey:UtilityTypeID;constraint:OnDelete:RESTRICT" json:"products,omitempty"` // 关联产品
}

// ProductType 产品类型
type ProductType struct {
	ID          string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`            // 类型ID
	Name        string    `gorm:"type:varchar(50);not null;uniqueIndex" json:"name"`                    // 类型名称
	Description string    `gorm:"type:text" json:"description"`                                         // 类型描述
	SortOrder   int       `gorm:"default:0;index" json:"sortOrder"`                                     // 排序顺序
	CreatedAt   time.Time `gorm:"not null" json:"createdAt"`                                           // 创建时间
	UpdatedAt   time.Time `gorm:"not null" json:"updatedAt"`                                           // 更新时间

	Products []Product `gorm:"foreignKey:ProductTypeID;constraint:OnDelete:RESTRICT" json:"products,omitempty"` // 关联产品
}

// ChannelType 通道类型
type ChannelType struct {
	ID          string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`            // 类型ID
	Name        string    `gorm:"type:varchar(50);not null;uniqueIndex" json:"name"`                    // 类型名称
	Description string    `gorm:"type:text" json:"description"`                                         // 类型描述
	SortOrder   int       `gorm:"default:0;index" json:"sortOrder"`                                     // 排序顺序
	CreatedAt   time.Time `gorm:"not null" json:"createdAt"`                                           // 创建时间
	UpdatedAt   time.Time `gorm:"not null" json:"updatedAt"`                                           // 更新时间

	Products []Product `gorm:"foreignKey:ChannelTypeID;constraint:OnDelete:RESTRICT" json:"products,omitempty"` // 关联产品
}

// MaterialType 材料类型
type MaterialType struct {
	ID          string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`            // 类型ID
	Name        string    `gorm:"type:varchar(50);not null;uniqueIndex" json:"name"`                    // 类型名称
	Description string    `gorm:"type:text" json:"description"`                                         // 类型描述
	SortOrder   int       `gorm:"default:0;index" json:"sortOrder"`                                     // 排序顺序
	CreatedAt   time.Time `gorm:"not null" json:"createdAt"`                                           // 创建时间
	UpdatedAt   time.Time `gorm:"not null" json:"updatedAt"`                                           // 更新时间

	Products []Product `gorm:"foreignKey:MaterialTypeID;constraint:OnDelete:RESTRICT" json:"products,omitempty"` // 关联产品
}
