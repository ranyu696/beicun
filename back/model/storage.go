package model

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// FileType 文件类型
type FileType string

const (
	FileTypeImage    FileType = "IMAGE"    // 图片
	FileTypeVideo    FileType = "VIDEO"    // 视频
	FileTypeOther    FileType = "OTHER"    // 其他
)

// Folder 文件夹模型
type Folder struct {
	ID          string       `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name        string       `gorm:"type:varchar(255);not null" json:"name"`           // 文件夹名称
	Path        string       `gorm:"type:varchar(1024);not null;uniqueIndex" json:"path"` // 完整路径
	Description *string      `gorm:"type:text" json:"description,omitempty"`           // 描述
	ParentID    *string      `gorm:"type:uuid;index" json:"parentId,omitempty"`       // 父文件夹ID
	CreatedAt   time.Time    `gorm:"not null" json:"createdAt"`                       // 创建时间
	UpdatedAt   time.Time    `gorm:"not null" json:"updatedAt"`                       // 更新时间

	// 关联
	Parent   *Folder    `gorm:"foreignKey:ParentID" json:"parent,omitempty"`          // 父文件夹
	Children []Folder   `gorm:"foreignKey:ParentID" json:"children,omitempty"`        // 子文件夹
	Files    []File     `gorm:"foreignKey:FolderID" json:"files,omitempty"`          // 文件列表
}

// File 文件模型
type File struct {
	ID          string     `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name        string     `gorm:"type:varchar(255);not null" json:"name"`           // 原始文件名
	Path        string     `gorm:"type:varchar(1024);not null" json:"path"`          // 存储路径
	URL         string     `gorm:"type:varchar(1024);not null" json:"url"`           // 访问URL
	Size        int64      `gorm:"not null" json:"size"`                             // 文件大小（字节）
	Type        FileType   `gorm:"type:varchar(20);not null" json:"type"`            // 文件类型
	MimeType    string     `gorm:"type:varchar(100);not null" json:"mimeType"`       // MIME类型
	Width       *int       `gorm:"" json:"width,omitempty"`                          // 图片宽度
	Height      *int       `gorm:"" json:"height,omitempty"`                         // 图片高度
	Duration    *int       `gorm:"" json:"duration,omitempty"`                       // 视频/音频时长（秒）
	FolderID    string    `gorm:"type:uuid;index" json:"folderId,omitempty"`       // 所属文件夹ID
	MD5         string     `gorm:"type:varchar(32);not null;uniqueIndex" json:"md5"` // 文件MD5
	UserID      string     `gorm:"type:uuid;not null;index" json:"userId"`          // 上传用户ID
	CreatedAt   time.Time  `gorm:"not null" json:"createdAt"`                       // 创建时间
	UpdatedAt   time.Time  `gorm:"not null" json:"updatedAt"`                       // 更新时间

	// 关联
	Folder    Folder    `gorm:"foreignKey:FolderID" json:"folder,omitempty"`       // 所属文件夹
	User      User       `gorm:"foreignKey:UserID" json:"user,omitempty"`          // 上传用户
}

// ChunkInfo 文件分片信息
type ChunkInfo struct {
	FileID    string `json:"fileId"`    // 文件ID
	ChunkSize int64  `json:"chunkSize"` // 分片大小
	ChunkNum  int    `json:"chunkNum"`  // 分片序号
	TotalSize int64  `json:"totalSize"` // 文件总大小
	Filename  string `json:"filename"`   // 文件名
	MimeType  string `json:"mimeType"`  // MIME类型
	FolderID  string `json:"folderId"`  // 文件夹ID
	
}

// FileUploadStatus 文件上传状态
type FileUploadStatus struct {
	FileID       string  `json:"fileId"`       // 文件ID
	UploadedSize int64   `json:"uploadedSize"` // 已上传大小
	TotalSize    int64   `json:"totalSize"`    // 文件总大小
	Status       string  `json:"status"`       // 上传状态：pending/uploading/completed/failed
	ChunksCount  int     `json:"chunksCount"`  // 总分片数
	ChunkSize    int64   `json:"chunkSize"`    // 分片大小
	Chunks       []int   `json:"chunks"`       // 分片上传状态：0-未上传，1-已上传
	Error        string  `json:"error,omitempty"` // 错误信息
	Progress     float64 `json:"progress"`    // 上传进度（百分比)
	LastUpdated  int64   `json:"lastUpdated"` // 最后更新时间戳
	
}

// BatchUploadResult 批量上传结果
type BatchUploadResult struct {
	SuccessCount int           `json:"successCount"` // 成功上传数量
	FailCount    int           `json:"failCount"`    // 失败数量
	Files        []FileResult  `json:"files"`        // 上传结果列表
}

// FileResult 单个文件上传结果
type FileResult struct {
	Name    string `json:"name"`    // 文件名
	Success bool   `json:"success"` // 是否成功
	Error   string `json:"error"`   // 错误信息
	FileID  string `json:"fileId"`  // 文件ID
	URL     string `json:"url"`     // 文件URL
}

// MarshalBinary 实现 encoding.BinaryMarshaler 接口
func (s *FileUploadStatus) MarshalBinary() ([]byte, error) {
	return json.Marshal(s)
}

// UnmarshalBinary 实现 encoding.BinaryUnmarshaler 接口
func (s *FileUploadStatus) UnmarshalBinary(data []byte) error {
	return json.Unmarshal(data, s)
}

// BeforeCreate 创建前回调
func (f *File) BeforeCreate(tx *gorm.DB) error {
	if f.ID == "" {
		f.ID = uuid.New().String()
	}
	return nil
}
