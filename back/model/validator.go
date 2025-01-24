package model

import (
	"errors"
	"regexp"
)

var (
	// 通用错误
	ErrInvalidInput = errors.New("无效的输入")
	ErrRequired     = errors.New("必填字段不能为空")

	// 用户相关错误
	ErrInvalidEmail    = errors.New("无效的邮箱格式")
	ErrPasswordTooWeak = errors.New("密码强度不足")
	ErrInvalidRole     = errors.New("无效的用户角色")

	// 产品相关错误
	ErrInvalidPrice      = errors.New("无效的价格")
	ErrInvalidDimension  = errors.New("无效的尺寸")
	ErrInvalidRating     = errors.New("无效的评分")
	ErrInvalidStatus     = errors.New("无效的状态")
	ErrInvalidSortOrder  = errors.New("无效的排序")
	ErrInvalidSlug       = errors.New("无效的Slug格式")
	ErrDuplicateSlug     = errors.New("Slug已存在")
	ErrInvalidURL        = errors.New("无效的URL格式")
)

// 邮箱验证正则
var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

// URL验证正则
var urlRegex = regexp.MustCompile(`^(http|https)://[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(?:/\S*)?$`)

// Slug验证正则
var slugRegex = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)

// ValidateUser 验证用户数据
func (u *User) Validate() error {
	// 验证必填字段
	if u.Email == "" {
		return ErrRequired
	}

	// 验证邮箱格式
	if !emailRegex.MatchString(u.Email) {
		return ErrInvalidEmail
	}
	// 验证密码强度
	if u.Password != "" && len(u.Password) < 8 {
		return ErrPasswordTooWeak
	}

	// 验证用户角色
	switch u.Role {
	case UserRoleUser, UserRoleEditor, UserRoleAdmin:
	default:
		return ErrInvalidRole
	}

	return nil
}

// ValidatePassword 验证密码
func (u *User) ValidatePassword() error {
	if u.Password == "" {
		return errors.New("密码不能为空")
	}
	if len(u.Password) < 6 {
		return errors.New("密码长度不能小于6位")
	}
	return nil
}

// ValidateProduct 验证产品数据
func (p *Product) Validate() error {
	// 验证必填字段
	if p.Name == "" || p.Slug == "" {
		return ErrRequired
	}

	// 验证Slug格式
	if !slugRegex.MatchString(p.Slug) {
		return ErrInvalidSlug
	}

	// 验证价格
	if p.Price < 0 {
		return ErrInvalidPrice
	}

	// 验证尺寸
	if p.Height <= 0 || p.Width <= 0 || p.Length <= 0 || 
	   p.ChannelLength <= 0 || p.TotalLength <= 0 || p.Weight <= 0 {
		return ErrInvalidDimension
	}

	// 验证URL（如果有）
	if p.TaobaoUrl != nil && !urlRegex.MatchString(*p.TaobaoUrl) {
		return ErrInvalidURL
	}
	if p.VideoUrl != nil && !urlRegex.MatchString(*p.VideoUrl) {
		return ErrInvalidURL
	}

	return nil
}

// ValidateProductRating 验证产品评分
func (r *Rating) Validate() error {
	// 验证评分范围
	if r.Rating < 1 || r.Rating > 5 {
		return ErrInvalidRating
	}

	// 验证必填字段
	if r.ProductID == 0 || r.UserID == "" {
		return ErrRequired
	}

	return nil
}

// ValidateReview 验证测评
func (r *Review) Validate() error {
	// 验证必填字段
	if r.Title == "" || r.ProductID == 0 || r.UserID == "" {
		return ErrRequired
	}

	// 验证状态
	switch r.Status {
	case ReviewStatusPending, ReviewStatusPublished, ReviewStatusArchived:
	default:
		return ErrInvalidStatus
	}

	return nil
}

// ValidateComment 验证评论
func (c *Comment) Validate() error {
	// 验证必填字段
	if c.Content == "" || c.ReviewID == "" || c.UserID == "" {
		return ErrRequired
	}

	// 验证状态
	switch c.Status {
	case CommentStatusPending, CommentStatusApproved, CommentStatusRejected:
	default:
		return ErrInvalidStatus
	}

	return nil
}

// ValidateTag 验证标签
func (t *Tag) Validate() error {
	// 验证必填字段
	if t.Name == "" {
		return ErrRequired
	}

	return nil
}

// ValidateProductImage 验证产品图片
func (pi *ProductImage) Validate() error {
	// 验证图片URL
	if pi.URL == "" {
		return errors.New("图片URL不能为空")
	}

	// 验证图片尺寸
	if pi.Width <= 0 {
		return errors.New("图片宽度必须大于0")
	}
	if pi.Height <= 0 {
		return errors.New("图片高度必须大于0")
	}

	// 验证排序顺序
	if pi.Sort < 0 {
		return errors.New("排序顺序不能为负数")
	}

	return nil
}

// ValidateMainImage 验证主图
func (mi *MainImage) Validate() error {
	if mi.URL == "" {
		return errors.New("主图URL不能为空")
	}
	if mi.Width <= 0 {
		return errors.New("主图宽度必须大于0")
	}
	if mi.Height <= 0 {
		return errors.New("主图高度必须大于0")
	}
	if mi.Sort < 0 {
		return errors.New("排序顺序不能为负数")
	}
	return nil
}

// ValidateSalesImage 验证销售图
func (si *SalesImage) Validate() error {
	if si.URL == "" {
		return errors.New("销售图URL不能为空")
	}
	if si.Width <= 0 {
		return errors.New("销售图宽度必须大于0")
	}
	if si.Height <= 0 {
		return errors.New("销售图高度必须大于0")
	}
	if si.Sort < 0 {
		return errors.New("排序顺序不能为负数")
	}
	return nil
}

// ValidateUtilityType 验证器具类型
func (ut *UtilityType) Validate() error {
	// 验证必填字段
	if ut.Name == "" {
		return ErrRequired
	}

	// 验证排序顺序
	if ut.SortOrder < 0 {
		return ErrInvalidSortOrder
	}

	return nil
}

// ValidateProductType 验证产品类型
func (pt *ProductType) Validate() error {
	// 验证必填字段
	if pt.Name == "" {
		return ErrRequired
	}

	// 验证排序顺序
	if pt.SortOrder < 0 {
		return ErrInvalidSortOrder
	}

	return nil
}

// ValidateChannelType 验证通道类型
func (ct *ChannelType) Validate() error {
	// 验证必填字段
	if ct.Name == "" {
		return ErrRequired
	}

	// 验证排序顺序
	if ct.SortOrder < 0 {
		return ErrInvalidSortOrder
	}

	return nil
}

// ValidateBrand 验证品牌
func (b *Brand) Validate() error {
	// 验证必填字段
	if b.Name == "" {
		return ErrRequired
	}

	// 验证URL（如果有）
	if b.Website != nil && !urlRegex.MatchString(*b.Website) {
		return ErrInvalidURL
	}

	// 验证排序顺序
	if b.SortOrder < 0 {
		return ErrInvalidSortOrder
	}

	return nil
}

// ValidateMaterialType 验证材料类型
func (mt *MaterialType) Validate() error {
	// 验证必填字段
	if mt.Name == "" {
		return ErrRequired
	}

	// 验证排序顺序
	if mt.SortOrder < 0 {
		return ErrInvalidSortOrder
	}

	return nil
}
