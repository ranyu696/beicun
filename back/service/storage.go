package service

import (
	"errors"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
	"gorm.io/gorm"

	"beicun/back/config"
	"beicun/back/model"
	"beicun/back/utils"
)

// 文件相关错误
var (
	ErrInvalidFileType = errors.New("不支持的文件类型")
	ErrFileNotFound    = errors.New("文件不存在")
	ErrFileUpload      = errors.New("文件上传失败")
	ErrFolderNotFound  = errors.New("文件夹不存在")
	ErrInvalidPath     = errors.New("无效的路径")
	ErrSameFolder      = errors.New("目标文件夹相同")
	ErrParentFolder    = errors.New("不能移动到子文件夹")
)

type StorageService struct {
	db     *gorm.DB
	cfg    *config.Config
	redis  *redis.Client
	logger *zap.Logger
}

func NewStorageService(db *gorm.DB, cfg *config.Config, redis *redis.Client, logger *zap.Logger) *StorageService {
	return &StorageService{
		db:     db,
		cfg:    cfg,
		redis:  redis,
		logger: logger,
	}
}

type FileUploadResult struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	URL      string `json:"url"`
	Size     int64  `json:"size"`
	Type     string `json:"type"`
	MimeType string `json:"mimeType"`
	Width    *int   `json:"width,omitempty"`
	Height   *int   `json:"height,omitempty"`
	Duration *int   `json:"duration,omitempty"`
	FolderID string `json:"folderId,omitempty"`
}

type CreateFolderRequest struct {
	Name        string  `json:"name" binding:"required"`
	ParentID    *string `json:"parentId"`
	Description *string `json:"description"`
}

type UpdateFolderRequest struct {
	Name        string  `json:"name"`
	Description *string `json:"description"`
}

type StorageStats struct {
	TotalFiles      int64 `json:"totalFiles"`      // 总文件数
	TotalFolders    int64 `json:"totalFolders"`    // 总文件夹数
	TotalSize       int64 `json:"totalSize"`       // 总存储大小
	ImageCount      int64 `json:"imageCount"`      // 图片数量
	VideoCount      int64 `json:"videoCount"`      // 视频数量
	OtherCount      int64 `json:"otherCount"`      // 其他文件数量
	RecentUploads   int64 `json:"recentUploads"`   // 最近上传数量（7天内）
	TopLevelFolders int64 `json:"topLevelFolders"` // 顶级文件夹数量
}


// CreateFolder 创建文件夹
func (s *StorageService) CreateFolder(c *gin.Context, req *CreateFolderRequest) (*model.Folder, error) {
	var path string
	if req.ParentID != nil {
		var parent model.Folder
		if err := s.db.First(&parent, "id = ?", req.ParentID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, ErrFolderNotFound
			}
			return nil, err
		}
		path = filepath.Join(parent.Path, req.Name)
	} else {
		path = "/" + req.Name
	}

	folder := &model.Folder{
		Name:        req.Name,
		Path:        path,
		Description: req.Description,
		ParentID:    req.ParentID,
	}

	if err := s.db.Create(folder).Error; err != nil {
		return nil, err
	}

	return folder, nil
}

// UpdateFolder 更新文件夹
func (s *StorageService) UpdateFolder(c *gin.Context, id string, req *UpdateFolderRequest) (*model.Folder, error) {
	var folder model.Folder
	if err := s.db.First(&folder, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrFolderNotFound
		}
		return nil, err
	}

	if req.Name != "" && req.Name != folder.Name {
		folder.Name = req.Name
		// 更新路径
		if folder.ParentID != nil {
			var parent model.Folder
			if err := s.db.First(&parent, "id = ?", folder.ParentID).Error; err != nil {
				return nil, err
			}
			folder.Path = filepath.Join(parent.Path, req.Name)
		} else {
			folder.Path = "/" + req.Name
		}

		// 更新子文件夹路径
		if err := s.updateChildrenPaths(&folder); err != nil {
			return nil, err
		}
	}

	if req.Description != nil {
		folder.Description = req.Description
	}

	if err := s.db.Save(&folder).Error; err != nil {
		return nil, err
	}

	return &folder, nil
}

// MoveFolder 移动文件夹
func (s *StorageService) MoveFolder(c *gin.Context, id string, targetParentID *string) error {
	var folder model.Folder
	if err := s.db.First(&folder, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrFolderNotFound
		}
		return err
	}

	// 检查是否移动到相同文件夹
	if (folder.ParentID == nil && targetParentID == nil) ||
		(folder.ParentID != nil && targetParentID != nil && *folder.ParentID == *targetParentID) {
		return ErrSameFolder
	}

	// 如果有目标父文件夹，检查是否存在
	var newPath string
	if targetParentID != nil {
		var parent model.Folder
		if err := s.db.First(&parent, "id = ?", targetParentID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ErrFolderNotFound
			}
			return err
		}

		// 检查是否移动到子文件夹
		if s.isChildFolder(&folder, *targetParentID) {
			return ErrParentFolder
		}

		newPath = filepath.Join(parent.Path, folder.Name)
	} else {
		newPath = "/" + folder.Name
	}

	folder.ParentID = targetParentID
	folder.Path = newPath

	return s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(&folder).Error; err != nil {
			return err
		}
		return s.updateChildrenPaths(&folder)
	})
}

// MoveFile 移动文件
func (s *StorageService) MoveFile(c *gin.Context, id string, targetFolderID string) error {
	var file model.File
	if err := s.db.First(&file, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrFileNotFound
		}
		return err
	}

	// 检查是否移动到相同文件夹
	if file.FolderID == targetFolderID {
		return ErrSameFolder
	}

	// 如果有目标文件夹，检查是否存在
	if targetFolderID != "" {
		var folder model.Folder
		if err := s.db.First(&folder, "id = ?", targetFolderID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ErrFolderNotFound
			}
			return err
		}
	}

	file.FolderID = targetFolderID
	return s.db.Save(&file).Error
}

// DeleteFolder 删除文件夹
func (s *StorageService) DeleteFolder(c *gin.Context, id string) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		// 删除文件夹
		if err := tx.Delete(&model.Folder{}, "id = ?", id).Error; err != nil {
			return err
		}
		// 删除文件夹下的所有文件
		if err := tx.Delete(&model.File{}, "folder_id = ?", id).Error; err != nil {
			return err
		}
		return nil
	})
}

// GetFolder 获取文件夹信息
func (s *StorageService) GetFolder(c *gin.Context, id string) (*model.Folder, error) {
	var folder model.Folder
	if err := s.db.First(&folder, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrFolderNotFound
		}
		return nil, err
	}
	return &folder, nil
}

// ListFolders 获取文件夹列表
func (s *StorageService) ListFolders(c *gin.Context, parentID *string, page, pageSize int) ([]*model.Folder, int64, error) {
	var folders []*model.Folder
	var total int64
	query := s.db.Model(&model.Folder{})

	if parentID != nil {
		query = query.Where("parent_id = ?", parentID)
	} else {
		query = query.Where("parent_id IS NULL")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Offset((page - 1) * pageSize).
		Limit(pageSize).
		Order("created_at DESC").
		Find(&folders).Error; err != nil {
		return nil, 0, err
	}

	return folders, total, nil
}

// DeleteFile 删除文件
func (s *StorageService) DeleteFile(c *gin.Context, id string) error {
	var file model.File
	if err := s.db.First(&file, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrFileNotFound
		}
		return err
	}

	// 删除物理文件
	if err := utils.DeleteFile(file.Path); err != nil {
		return err
	}

	// 删除数据库记录
	return s.db.Delete(&file).Error
}

// GetFile 获取文件信息
func (s *StorageService) GetFile(c *gin.Context, id string) (*model.File, error) {
	var file model.File
	if err := s.db.First(&file, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrFileNotFound
		}
		return nil, err
	}
	return &file, nil
}

// ListFiles 获取文件列表
func (s *StorageService) ListFiles(c *gin.Context, folderID *string, fileType string, page, pageSize int) ([]*model.File, int64, error) {
	var files []*model.File
	var total int64
	query := s.db.Model(&model.File{})

	if folderID != nil {
		query = query.Where("folder_id = ?", folderID)
	}
	if fileType != "" {
		query = query.Where("type = ?", fileType)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Offset((page - 1) * pageSize).
		Limit(pageSize).
		Order("created_at DESC").
		Find(&files).Error; err != nil {
		return nil, 0, err
	}

	return files, total, nil
}

// GetStorageStats 获取存储统计信息
func (s *StorageService) GetStorageStats(c *gin.Context) (*StorageStats, error) {
	var stats StorageStats
	var err error

	// 获取总文件数和总大小
	if err = s.db.Model(&model.File{}).Count(&stats.TotalFiles).Error; err != nil {
		return nil, err
	}
	if err = s.db.Model(&model.File{}).Select("COALESCE(SUM(size), 0)").Scan(&stats.TotalSize).Error; err != nil {
		return nil, err
	}

	// 获取文件夹数
	if err = s.db.Model(&model.Folder{}).Count(&stats.TotalFolders).Error; err != nil {
		return nil, err
	}

	// 获取各类型文件数量
	if err = s.db.Model(&model.File{}).Where("type = ?", model.FileTypeImage).Count(&stats.ImageCount).Error; err != nil {
		return nil, err
	}
	if err = s.db.Model(&model.File{}).Where("type = ?", model.FileTypeVideo).Count(&stats.VideoCount).Error; err != nil {
		return nil, err
	}
	if err = s.db.Model(&model.File{}).Where("type = ?", model.FileTypeOther).Count(&stats.OtherCount).Error; err != nil {
		return nil, err
	}

	// 获取最近7天上传数量
	sevenDaysAgo := time.Now().AddDate(0, 0, -7)
	if err = s.db.Model(&model.File{}).Where("created_at >= ?", sevenDaysAgo).Count(&stats.RecentUploads).Error; err != nil {
		return nil, err
	}

	// 获取顶级文件夹数量
	if err = s.db.Model(&model.Folder{}).Where("parent_id IS NULL").Count(&stats.TopLevelFolders).Error; err != nil {
		return nil, err
	}

	return &stats, nil
}

// 更新子文件夹路径
func (s *StorageService) updateChildrenPaths(folder *model.Folder) error {
	var children []model.Folder
	if err := s.db.Where("parent_id = ?", folder.ID).Find(&children).Error; err != nil {
		return err
	}

	for _, child := range children {
		child.Path = filepath.Join(folder.Path, child.Name)
		if err := s.db.Save(&child).Error; err != nil {
			return err
		}
		if err := s.updateChildrenPaths(&child); err != nil {
			return err
		}
	}

	return nil
}

// 检查是否是子文件夹
func (s *StorageService) isChildFolder(folder *model.Folder, targetID string) bool {
	var children []model.Folder
	if err := s.db.Where("parent_id = ?", folder.ID).Find(&children).Error; err != nil {
		return false
	}

	for _, child := range children {
		if child.ID == targetID {
			return true
		}
		if s.isChildFolder(&child, targetID) {
			return true
		}
	}

	return false
}

// getFileType 根据文件扩展名获取文件类型
func (s *StorageService) getFileType(ext string) model.FileType {
	switch ext {
	case ".jpg", ".jpeg", ".png", ".gif", ".webp":
		return model.FileTypeImage
	case ".mp4", ".avi", ".mov", ".wmv":
		return model.FileTypeVideo
	default:
		return model.FileTypeOther
	}
}

// isAllowedExt 检查是否是允许的文件扩展名
func (s *StorageService) isAllowedExt(ext string) bool {
	allowedExts := []string{
		".jpg", ".jpeg", ".png", ".gif", ".webp",
		".mp4", ".avi", ".mov", ".wmv",
	}
	for _, allowed := range allowedExts {
		if ext == allowed {
			return true
		}
	}
	return false
}

// IsImageFile 检查是否是图片文件
func (s *StorageService) IsImageFile(ext string) bool {
	imageExts := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".gif":  true,
		".bmp":  true,
		".webp": true,
	}
	return imageExts[ext]
}

// IsVideoFile 检查是否是视频文件
func (s *StorageService) IsVideoFile(ext string) bool {
	videoExts := map[string]bool{
		".mp4":  true,
		".avi":  true,
		".mov":  true,
		".wmv":  true,
		".flv":  true,
		".mkv":  true,
		".webm": true,
	}
	return videoExts[ext]
}
