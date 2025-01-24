package model

import (
	"time"
	"mime/multipart"
)

// FileUploadInfo 文件上传信息
type FileUploadInfo struct {
	ID           string    `json:"id"`           // 文件唯一标识
	Name         string    `json:"name"`         // 文件名
	Size         int64     `json:"size"`         // 文件大小
	ContentType  string    `json:"contentType"`  // 文件类型
	MD5          string    `json:"md5"`          // 文件MD5
	Status       string    `json:"status"`       // 上传状态: uploading/merging/completed/failed
	ErrorMessage string    `json:"errorMessage"` // 错误信息
	ChunkSize    int64     `json:"chunkSize"`    // 分片大小
	ChunkCount   int       `json:"chunkCount"`   // 分片总数
	UploadedSize int64     `json:"uploadedSize"` // 已上传大小
	Chunks       []int     `json:"chunks"`       // 已上传分片
	FolderID     string    `json:"folderId"`     // 文件夹ID
	FilePath     string    `json:"filePath"`     // 文件路径
	CreatedAt    time.Time `json:"createdAt"`    // 创建时间
	UpdatedAt    time.Time `json:"updatedAt"`    // 更新时间
}

// UploadChunkInfo 分片上传信息
type UploadChunkInfo struct {
	FileID    string `json:"fileId"`    // 文件ID
	ChunkNum  int    `json:"chunkNum"`  // 分片序号
	ChunkSize int64  `json:"chunkSize"` // 分片大小
	Total     int64  `json:"total"`     // 总大小
	Filename  string `json:"filename"`  // 原始文件名
	MimeType  string `json:"mimeType"`  // 文件类型
	FolderID  string `json:"folderId"`  // 文件夹ID
}

// CheckUploadRequest 检查上传请求
type CheckUploadRequest struct {
	MD5      string `json:"md5"`      // 文件MD5
	Name     string `json:"name"`     // 文件名
	Size     int64  `json:"size"`     // 文件大小
	Type     string `json:"type"`     // 文件类型
}

// CheckUploadResponse 检查上传响应
type CheckUploadResponse struct {
	Status      string `json:"status"`      // 上传状态: new/uploading/completed
	FileID      string `json:"fileId"`      // 文件ID
	ChunkSize   int64  `json:"chunkSize"`   // 分片大小
	ChunkCount  int    `json:"chunkCount"`  // 分片总数
	UploadedNum int    `json:"uploadedNum"` // 已上传分片数
	URL         string `json:"url"`         // 文件URL(秒传时返回)
}

// ChunkUpload 分片上传信息
type ChunkUpload struct {
	FileID    string                `json:"fileId"`    // 文件唯一标识
	ChunkNum  int                   `json:"chunkNum"`  // 分片序号
	ChunkFile *multipart.FileHeader `json:"-"`         // 分片文件
	Filename  string                `json:"filename"`  // 原始文件名
	MimeType  string                `json:"mimeType"`  // 文件类型
	FolderID  string                `json:"folderId"`  // 文件夹ID
}

// FileUploadCheck 文件上传检查结果
type FileUploadCheck struct {
	Exists     bool   `json:"exists"`     // 文件是否存在
	FileID     string `json:"fileId"`     // 文件ID
	ChunkSize  int64  `json:"chunkSize"`  // 分片大小
	ChunkCount int    `json:"chunkCount"` // 分片数量
	Status     string `json:"status"`     // 上传状态
	URL        string `json:"url"`        // 文件URL(秒传时返回)
}

// UploadInfo 上传信息
type UploadInfo struct {
	ID         string    `json:"id"`         // 文件唯一标识
	Name       string    `json:"name"`       // 文件名
	Size       int64     `json:"size"`       // 文件大小
	ContentType string   `json:"contentType"` // 文件类型
	MD5        string    `json:"md5"`        // 文件MD5
	Status     string    `json:"status"`     // 上传状态
	ChunkSize  int64     `json:"chunkSize"`  // 分片大小
	ChunkCount int       `json:"chunkCount"` // 分片总数
	Chunks     []int     `json:"chunks"`     // 已上传分片
	FolderID   string    `json:"folderId"`   // 文件夹ID
	CreatedAt  time.Time `json:"createdAt"`  // 创建时间
	UpdatedAt  time.Time `json:"updatedAt"`  // 更新时间
}
