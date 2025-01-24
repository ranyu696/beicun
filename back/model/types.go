package model

// UserRole 用户角色
type UserRole string

const (
	UserRoleUser   UserRole = "USER"   // 普通用户
	UserRoleEditor UserRole = "EDITOR" // 编辑
	UserRoleAdmin  UserRole = "ADMIN"  // 管理员
	UserRoleGuest  UserRole = "GUEST"  // 访客
)

// UserStatus 用户状态
type UserStatus string

const (
	UserStatusActive   UserStatus = "ACTIVE"   // 正常
	UserStatusBlocked  UserStatus = "BLOCKED"  // 已封禁
	UserStatusInactive UserStatus = "INACTIVE" // 未激活
)

// ReviewStatus 测评状态
type ReviewStatus string

const (
	ReviewStatusPending   ReviewStatus = "PENDING"   // 已下架
	ReviewStatusPublished ReviewStatus = "PUBLISHED" // 已发布
	ReviewStatusArchived  ReviewStatus = "ARCHIVED"  // 草稿
)

// CommentStatus 评论状态
type CommentStatus string

const (
	CommentStatusPending  CommentStatus = "PENDING"  // 待审核
	CommentStatusApproved CommentStatus = "APPROVED" // 已通过
	CommentStatusRejected CommentStatus = "REJECTED" // 已拒绝
)

// StimulationLevel 刺激度
type StimulationLevel string

const (
	StimulationLow    StimulationLevel = "LOW"    // 低刺激
	StimulationMedium StimulationLevel = "MEDIUM" // 中等刺激
	StimulationHigh   StimulationLevel = "HIGH"   // 高刺激
)

// SoftnessLevel 软硬度
type SoftnessLevel string

const (
	SoftnessUltraSoft SoftnessLevel = "ULTRA_SOFT" // 超软
	SoftnessSoft      SoftnessLevel = "SOFT"       // 软
	SoftnessMedium    SoftnessLevel = "MEDIUM"     // 中等
	SoftnessHard      SoftnessLevel = "HARD"       // 硬
	SoftnessUltraHard SoftnessLevel = "ULTRA_HARD" // 超硬
)

// TightnessLevel 紧致度
type TightnessLevel string

const (
	TightnessTight  TightnessLevel = "TIGHT"  // 紧
	TightnessMedium TightnessLevel = "MEDIUM" // 中等
	TightnessLoose  TightnessLevel = "LOOSE"  // 松
)

// DurabilityLevel 耐用度
type DurabilityLevel string

const (
	DurabilityHigh   DurabilityLevel = "HIGH"   // 高耐用
	DurabilityMedium DurabilityLevel = "MEDIUM" // 中等耐用
	DurabilityLow    DurabilityLevel = "LOW"    // 低耐用
)

// Level 通用等级（用于气味度/出油量）
type Level string

const (
	LevelHigh   Level = "HIGH"   // 高
	LevelMedium Level = "MEDIUM" // 中等
	LevelLow    Level = "LOW"    // 低
)
