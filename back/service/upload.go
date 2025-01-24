package service

import (
	"bytes"
	"crypto/md5"
	"encoding/hex"
	"errors"
	"fmt"
	"image"
	_ "image/gif"  // 支持 GIF 格式
	_ "image/jpeg" // 支持 JPEG 格式
	_ "image/png"  // 支持 PNG 格式
	"io"
	"log"
	"math"
	"mime/multipart"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/disintegration/imaging"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/gorm"

	"beicun/back/config"
	"beicun/back/model"
	"beicun/back/utils"
)

// UploadService 上传服务
type UploadService struct {
	db     *gorm.DB
	logger *zap.Logger
	cfg    *config.StorageConfig
	uploadInfos sync.Map
}

// NewUploadService 创建上传服务
func NewUploadService(db *gorm.DB, logger *zap.Logger, cfg *config.StorageConfig) *UploadService {
	return &UploadService{
		db:     db,
		logger: logger,
		cfg:    cfg,
	}
}

// CheckUpload 检查文件是否存在
func (s *UploadService) CheckUpload(c *gin.Context, info *model.FileUploadInfo) (*model.FileUploadCheck, error) {
	log.Printf("开始检查文件: %+v", info)

	// 检查文件夹是否存在
	if info.FolderID != "" {
		var folder model.Folder
		if err := s.db.First(&folder, "id = ?", info.FolderID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				log.Printf("文件夹不存在: %s", info.FolderID)
				return nil, fmt.Errorf("文件夹不存在")
			}
			log.Printf("查询文件夹失败: %v", err)
			return nil, fmt.Errorf("查询文件夹失败: %w", err)
		}
		log.Printf("文件夹存在: %s", folder.Name)
	}

	// 检查文件大小是否超过限制
	if info.Size > s.cfg.MaxFileSize {
		log.Printf("文件大小超过限制: %d > %d", info.Size, s.cfg.MaxFileSize)
		return nil, fmt.Errorf("文件大小超过限制")
	}

	// 检查文件是否已存在
	var existingFile model.File
	if err := s.db.First(&existingFile, "folder_id = ? AND name = ?", info.FolderID, info.Name).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("查询文件失败: %v", err)
			return nil, fmt.Errorf("查询文件失败: %w", err)
		}
		log.Printf("文件不存在，可以上传")
	} else {
		log.Printf("文件已存在: %s", existingFile.Name)
		return &model.FileUploadCheck{
			Exists: true,
			FileID: existingFile.ID,
			URL:    existingFile.URL,
		}, nil
	}

	// 生成文件ID
	fileID := uuid.New().String()
	log.Printf("生成文件ID: %s", fileID)

	// 计算分片大小和数量
	chunkSize := s.cfg.ChunkSize
	chunkCount := (info.Size + chunkSize - 1) / chunkSize
	log.Printf("计算分片信息: 大小=%d, 数量=%d", chunkSize, chunkCount)

	// 创建上传信息
	uploadInfo := &model.FileUploadInfo{
		ID:          fileID,
		Name:        info.Name,
		Size:        info.Size,
		FolderID:    info.FolderID,
		ChunkSize:   chunkSize,
		ChunkCount:  int(chunkCount),
		Chunks:      make([]int, chunkCount),
		Status:      "uploading",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	// 将上传信息保存到内存
	if err := s.saveUploadInfo(fileID, uploadInfo); err != nil {
		log.Printf("保存上传信息失败: %v", err)
		return nil, fmt.Errorf("保存上传信息失败: %w", err)
	}

	result := &model.FileUploadCheck{
		Exists:     false,
		FileID:     fileID,
		ChunkSize:  chunkSize,
		ChunkCount: int(chunkCount),
		Status:     "uploading",
	}
	log.Printf("返回检查结果: %+v", result)
	return result, nil
}

// UploadChunk 上传分片
func (s *UploadService) UploadChunk(c *gin.Context, info *model.UploadChunkInfo, data io.Reader) error {
	s.logger.Info("开始处理分片上传",
		zap.String("fileID", info.FileID),
		zap.Int("chunkNum", info.ChunkNum),
		zap.Int64("chunkSize", info.ChunkSize),
	)

	// 获取上传信息
	uploadInfo, err := s.getUploadInfo(info.FileID)
	if err != nil {
		s.logger.Error("获取上传信息失败",
			zap.String("fileID", info.FileID),
			zap.Error(err),
		)
		return fmt.Errorf("获取上传信息失败: %w", err)
	}

	if uploadInfo == nil {
		return fmt.Errorf("上传信息不存在，请先调用检查接口")
	}

	// 验证分片序号
	if info.ChunkNum >= uploadInfo.ChunkCount {
		return fmt.Errorf("无效的分片序号: %d", info.ChunkNum)
	}

	// 检查分片是否已上传
	if uploadInfo.Chunks[info.ChunkNum] == 1 {
		s.logger.Debug("分片已上传，跳过",
			zap.String("fileID", info.FileID),
			zap.Int("chunkNum", info.ChunkNum),
		)
		return nil
	}

	// 计算分片大小
	expectedSize := uploadInfo.ChunkSize
	if info.ChunkNum == uploadInfo.ChunkCount-1 {
		expectedSize = uploadInfo.Size - int64(info.ChunkNum)*uploadInfo.ChunkSize
	}

	// 保存分片
	chunkDir := filepath.Join(s.cfg.Path, s.cfg.TempDir, info.FileID)
	if err := os.MkdirAll(chunkDir, 0755); err != nil {
		s.logger.Error("创建分片目录失败",
			zap.String("fileID", info.FileID),
			zap.String("dir", chunkDir),
			zap.Error(err),
		)
		return fmt.Errorf("创建目录失败: %w", err)
	}

	chunkPath := filepath.Join(chunkDir, fmt.Sprintf("%d", info.ChunkNum))
	f, err := os.OpenFile(chunkPath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0644)
	if err != nil {
		s.logger.Error("创建分片文件失败",
			zap.String("fileID", info.FileID),
			zap.Int("chunkNum", info.ChunkNum),
			zap.String("path", chunkPath),
			zap.Error(err),
		)
		return fmt.Errorf("创建分片文件失败: %w", err)
	}
	defer f.Close()

	written, err := io.Copy(f, data)
	if err != nil {
		s.logger.Error("写入分片数据失败",
			zap.String("fileID", info.FileID),
			zap.Int("chunkNum", info.ChunkNum),
			zap.Error(err),
		)
		os.Remove(chunkPath)
		return fmt.Errorf("保存分片数据失败: %w", err)
	}

	// 验证分片大小
	if written != expectedSize {
		s.logger.Error("分片大小不匹配",
			zap.String("fileID", info.FileID),
			zap.Int("chunkNum", info.ChunkNum),
			zap.Int64("written", written),
			zap.Int64("expected", expectedSize),
		)
		os.Remove(chunkPath)
		return fmt.Errorf("分片大小不匹配: %d != %d", written, expectedSize)
	}

	// 确保文件已经写入磁盘
	if err := f.Sync(); err != nil {
		s.logger.Error("同步分片数据失败",
			zap.String("fileID", info.FileID),
			zap.Int("chunkNum", info.ChunkNum),
			zap.Error(err),
		)
		os.Remove(chunkPath)
		return fmt.Errorf("同步分片数据失败: %w", err)
	}

	// 更新上传状态
	uploadInfo.Chunks[info.ChunkNum] = 1
	uploadInfo.UpdatedAt = time.Now()

	// 计算已上传大小
	uploadedSize := int64(0)
	allUploaded := true
	missingChunks := make([]int, 0)
	for i := 0; i < uploadInfo.ChunkCount; i++ {
		if uploadInfo.Chunks[i] == 1 {
			if i == uploadInfo.ChunkCount-1 {
				uploadedSize += uploadInfo.Size - int64(i)*uploadInfo.ChunkSize
			} else {
				uploadedSize += uploadInfo.ChunkSize
			}
		} else {
			allUploaded = false
			missingChunks = append(missingChunks, i)
		}
	}

	uploadInfo.UploadedSize = uploadedSize
	progress := float64(uploadedSize)/float64(uploadInfo.Size)*100

	if len(missingChunks) > 0 {
		s.logger.Debug("部分分片未上传",
			zap.String("fileID", info.FileID),
			zap.Int64("uploadedSize", uploadedSize),
			zap.Float64("progress", progress),
			zap.Ints("missingChunks", missingChunks[:min(10, len(missingChunks))]), // 只显示前10个未上传的分片
			zap.Int("totalMissingChunks", len(missingChunks)),
		)
	}

	s.logger.Info("更新上传进度",
		zap.String("fileID", info.FileID),
		zap.Int64("uploadedSize", uploadedSize),
		zap.Int64("totalSize", uploadInfo.Size),
		zap.Float64("progress", progress),
	)

	if allUploaded {
		s.logger.Info("所有分片已上传，准备合并",
			zap.String("fileID", info.FileID),
			zap.Int("chunkCount", uploadInfo.ChunkCount),
			zap.Int64("totalSize", uploadInfo.Size),
		)
		uploadInfo.Status = "merging"
		if err := s.saveUploadInfo(info.FileID, uploadInfo); err != nil {
			s.logger.Error("保存上传状态失败",
				zap.String("fileID", info.FileID),
				zap.Error(err),
			)
			return fmt.Errorf("保存上传信息失败: %w", err)
		}

		// 异步合并文件
		go func() {
			defer func() {
				if r := recover(); r != nil {
					s.logger.Error("合并文件发生panic",
						zap.String("fileID", uploadInfo.ID),
						zap.Any("error", r),
					)
					uploadInfo.Status = "failed"
					uploadInfo.ErrorMessage = fmt.Sprintf("合并文件发生panic: %v", r)
					s.saveUploadInfo(info.FileID, uploadInfo)
				}
			}()

			s.logger.Info("开始异步合并文件",
				zap.String("fileID", uploadInfo.ID),
				zap.String("filename", uploadInfo.Name),
			)

			if err := s.MergeFile(c,uploadInfo.ID); err != nil {
				s.logger.Error("合并文件失败",
					zap.String("fileID", uploadInfo.ID),
					zap.Error(err),
				)
				uploadInfo.Status = "failed"
				uploadInfo.ErrorMessage = err.Error()
			} else {
				s.logger.Info("文件合并成功",
					zap.String("fileID", uploadInfo.ID),
					zap.String("filename", uploadInfo.Name),
				)
				uploadInfo.Status = "completed"
			}
			if err := s.saveUploadInfo(info.FileID, uploadInfo); err != nil {
				s.logger.Error("保存合并状态失败",
					zap.String("fileID", uploadInfo.ID),
					zap.Error(err),
				)
			}
		}()
	} else {
		s.logger.Debug("部分分片未上传",
			zap.String("fileID", uploadInfo.ID),
			zap.Int64("uploadedSize", uploadedSize),
			zap.Float64("progress", progress),
		)
		if err := s.saveUploadInfo(info.FileID, uploadInfo); err != nil {
			return fmt.Errorf("保存上传信息失败: %w", err)
		}
	}

	return nil
}

// MergeFile 合并文件
func (s *UploadService) MergeFile(c *gin.Context,fileID string ) error {
	uploadInfo, err := s.getUploadInfo(fileID)
	if err != nil {
		return fmt.Errorf("获取上传信息失败: %w", err)
	}

	// 确保所有分片都已上传
	for i := 0; i < uploadInfo.ChunkCount; i++ {
		if uploadInfo.Chunks[i] != 1 {
			return fmt.Errorf("分片 %d 未上传", i)
		}
	}

	// 创建合并目录
	mergeDir := filepath.Join(s.cfg.Path, s.cfg.MergeDir)
	if err := os.MkdirAll(mergeDir, 0755); err != nil {
		return fmt.Errorf("创建合并目录失败: %w", err)
	}

	// 创建临时合并文件
	tempMergedPath := filepath.Join(mergeDir, fileID+".tmp")
	mergedFile, err := os.Create(tempMergedPath)
	if err != nil {
		return fmt.Errorf("创建合并文件失败: %w", err)
	}
	defer mergedFile.Close() // 确保文件最终会被关闭

	// 计算MD5
	hash := md5.New()

	// 获取临时目录
	tempDir := filepath.Join(s.cfg.Path, s.cfg.TempDir, fileID)

	// 按顺序合并分片
	for i := 0; i < uploadInfo.ChunkCount; i++ {
		chunkPath := filepath.Join(tempDir, strconv.Itoa(i))
		chunkFile, err := os.Open(chunkPath)
		if err != nil {
			return fmt.Errorf("打开分片文件失败: %w", err)
		}

		_, err = io.Copy(io.MultiWriter(mergedFile, hash), chunkFile)
		chunkFile.Close() // 立即关闭分片文件

		if err != nil {
			return fmt.Errorf("合并分片失败: %w", err)
		}

		s.logger.Debug("分片合并成功",
			zap.String("fileID", fileID),
			zap.Int("chunkNum", i),
		)
	}

	// 计算MD5
	calculatedMD5 := hex.EncodeToString(hash.Sum(nil))
	if uploadInfo.MD5 != "" && calculatedMD5 != uploadInfo.MD5 {
		return fmt.Errorf("MD5校验失败，期望：%s，实际：%s", uploadInfo.MD5, calculatedMD5)
	}

	s.logger.Info("MD5校验通过",
		zap.String("fileID", fileID),
		zap.String("expectedMD5", uploadInfo.MD5),
		zap.String("calculatedMD5", calculatedMD5),
	)

	// 构建最终存储路径
	now := time.Now()
	ext := filepath.Ext(uploadInfo.Name)
	originalName := uploadInfo.Name // 保存原始文件名
	finalName := fmt.Sprintf("%d/%02d/%02d/%s%s",
		now.Year(),
		now.Month(),
		now.Day(),
		fileID,
		ext,
	)
	s.logger.Info("准备移动文件",
		zap.String("fileID", fileID),
		zap.String("originalName", originalName),
		zap.String("finalName", finalName),
	)

	finalPath := filepath.Join(s.cfg.Path, s.cfg.UploadDir, finalName)
	if err := os.MkdirAll(filepath.Dir(finalPath), 0755); err != nil {
		s.logger.Error("创建目标目录失败",
			zap.String("fileID", fileID),
			zap.String("path", filepath.Dir(finalPath)),
			zap.Error(err),
		)
		return fmt.Errorf("创建目标目录失败: %w", err)
	}

	// 确保目标文件不存在
	if _, err := os.Stat(finalPath); err == nil {
		s.logger.Info("目标文件已存在，将被覆盖",
			zap.String("fileID", fileID),
			zap.String("path", finalPath),
		)
		os.Remove(finalPath)
	}

	// 在移动文件之前确保源文件已经关闭
	mergedFile.Close()

	s.logger.Info("开始移动文件",
		zap.String("fileID", fileID),
		zap.String("from", tempMergedPath),
		zap.String("to", finalPath),
	)

	if err := os.Rename(tempMergedPath, finalPath); err != nil {
		s.logger.Error("移动文件失败",
			zap.String("fileID", fileID),
			zap.String("from", tempMergedPath),
			zap.String("to", finalPath),
			zap.Error(err),
		)
		return fmt.Errorf("移动文件到最终位置失败: %w", err)
	}

	s.logger.Info("文件移动成功",
		zap.String("fileID", fileID),
		zap.String("finalPath", finalPath),
	)

	// 清理临时文件
	if err := os.RemoveAll(tempDir); err != nil {
		s.logger.Error("清理临时文件失败",
			zap.String("fileID", fileID),
			zap.String("tempDir", tempDir),
			zap.Error(err),
		)
		// 不返回错误，继续执行
	}

	// 所有文件操作成功后，更新内存中的状态
	uploadInfo.Status = "completed"
	uploadInfo.FilePath = finalPath
	uploadInfo.Name = originalName // 保持原始文件名
	uploadInfo.MD5 = calculatedMD5

	// 开启数据库事务
	tx := s.db.Begin()
	if tx.Error != nil {
		s.logger.Error("开启数据库事务失败",
			zap.String("fileID", fileID),
			zap.Error(tx.Error),
		)
		return fmt.Errorf("开启数据库事务失败: %w", tx.Error)
	}

	// 构建URL路径
	urlPath := filepath.ToSlash(fmt.Sprintf("/%s/%s", s.cfg.UploadDir, finalName))

	// 在事务中创建文件记录
	file := &model.File{
		ID:        uploadInfo.ID,
		Name:      originalName,          // 使用原始文件名
		Type:      model.FileTypeVideo,
		Size:      uploadInfo.Size,
		Path:      finalPath,            // 实际存储路径
		URL:       urlPath,              // URL访问路径
		MD5:       uploadInfo.MD5,
		FolderID:  uploadInfo.FolderID,
		CreatedAt: uploadInfo.CreatedAt,
		UpdatedAt: time.Now(),
		UserID:    utils.GetUserIDFromContext(c),
		MimeType:  "video/mp4",
	}

	s.logger.Info("准备写入数据库",
		zap.String("fileID", fileID),
		zap.String("name", file.Name),
		zap.String("path", file.Path),
		zap.String("url", file.URL),
		zap.String("folderID", file.FolderID),
		zap.String("userID", file.UserID),
	)

	if err := tx.Create(file).Error; err != nil {
		tx.Rollback()
		s.logger.Error("保存文件记录失败",
			zap.String("fileID", fileID),
			zap.String("name", file.Name),
			zap.Error(err),
		)
		return fmt.Errorf("保存文件记录失败: %w", err)
	}

	// 提交事务
	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		s.logger.Error("提交事务失败",
			zap.String("fileID", fileID),
			zap.Error(err),
		)
		return fmt.Errorf("提交事务失败: %w", err)
	}

	// 数据库操作成功后，清理内存中的上传信息
	s.deleteUploadInfo(fileID)

	s.logger.Info("文件处理完成",
		zap.String("fileID", fileID),
		zap.String("name", file.Name),
		zap.String("path", file.Path),
		zap.String("folderID", file.FolderID),
	)

	return nil
}

// InitUpload 初始化上传
func (s *UploadService) InitUpload(c *gin.Context, info *model.FileUploadInfo) error {
	// 生成上传ID
	if info.ID == "" {
		info.ID = uuid.New().String()
	}

	// 检查文件大小
	if info.Size > s.cfg.MaxFileSize {
		return fmt.Errorf("文件大小超过限制")
	}

	// 计算分片数量
	info.ChunkCount = int(math.Ceil(float64(info.Size) / float64(s.cfg.ChunkSize)))
	info.ChunkSize = s.cfg.ChunkSize
	info.Chunks = make([]int, info.ChunkCount)
	info.Status = "uploading"
	info.CreatedAt = time.Now()
	info.UpdatedAt = time.Now()

	// 创建临时目录
	tempDir := filepath.Join(s.cfg.Path, s.cfg.TempDir, info.ID)
	if err := os.MkdirAll(tempDir, 0755); err != nil {
		return fmt.Errorf("创建临时目录失败: %w", err)
	}

	// 保存上传信息
	if err := s.saveUploadInfo(info.ID, info); err != nil {
		return fmt.Errorf("保存上传信息失败: %w", err)
	}

	return nil
}

// getUploadInfo 获取上传信息
func (s *UploadService) getUploadInfo(fileID string) (*model.FileUploadInfo, error) {
	if value, ok := s.uploadInfos.Load(fileID); ok {
		return value.(*model.FileUploadInfo), nil
	}
	return nil, fmt.Errorf("上传信息不存在")
}

// saveUploadInfo 保存上传信息
func (s *UploadService) saveUploadInfo(fileID string, info *model.FileUploadInfo) error {
	s.uploadInfos.Store(fileID, info)
	return nil
}

// deleteUploadInfo 删除上传信息
func (s *UploadService) deleteUploadInfo(fileID string) {
	s.uploadInfos.Delete(fileID)
}

// isAllowedType 检查是否是允许的文件类型
func (s *UploadService) isAllowedType(ext string) bool {
	for _, t := range s.cfg.AllowedTypes {
		if strings.EqualFold(t, ext) {
			return true
		}
	}
	return false
}

// getFileType 获取文件类型
func (s *UploadService) getFileType(ext string) model.FileType {
	switch strings.ToLower(ext) {
	case ".jpg", ".jpeg", ".png", ".gif":
		return model.FileTypeImage
	case ".mp4", ".avi", ".mov":
		return model.FileTypeVideo
	default:
		return model.FileTypeOther
	}
}

// GetUploadProgress 获取上传进度
func (s *UploadService) GetUploadProgress(c *gin.Context, fileID string) (*model.FileUploadInfo, error) {
	info, err := s.getUploadInfo(fileID)
	if err != nil {
		return nil, fmt.Errorf("上传记录不存在")
	}
	return info, nil
}

// BatchUploadImages 批量上传图片
func (s *UploadService) BatchUploadImages(c *gin.Context, files []*multipart.FileHeader, folderID string) (*model.BatchUploadResult, error) {
	result := &model.BatchUploadResult{
		Files: make([]model.FileResult, len(files)),
	}

	for i, file := range files {
		fileResult := &result.Files[i]
		fileResult.Name = file.Filename

		// 检查文件类型
		ext := strings.ToLower(filepath.Ext(file.Filename))
		if !s.isImageType(ext) {
			fileResult.Success = false
			fileResult.Error = "不支持的图片格式"
			result.FailCount++
			continue
		}

		// 检查文件大小
		if file.Size > s.cfg.MaxFileSize {
			fileResult.Success = false
			fileResult.Error = fmt.Sprintf("文件大小超过限制: %d MB", s.cfg.MaxFileSize/1024/1024)
			result.FailCount++
			continue
		}

		// 生成存储路径
		now := time.Now()
		fileID := uuid.New().String()
		relativePath := filepath.Join(
			fmt.Sprintf("%d", now.Year()),
			fmt.Sprintf("%02d", now.Month()),
			fmt.Sprintf("%02d", now.Day()),
			fileID+ext,
		)
		fullPath := filepath.Join(s.cfg.Path, s.cfg.UploadDir, relativePath)

		// 确保目录存在
		if err := utils.EnsureDir(filepath.Dir(fullPath)); err != nil {
			fileResult.Success = false
			fileResult.Error = "创建目录失败"
			result.FailCount++
			continue
		}

		// 保存文件
		if err := c.SaveUploadedFile(file, fullPath); err != nil {
			fileResult.Success = false
			fileResult.Error = "保存文件失败"
			result.FailCount++
			continue
		}

		// 计算MD5
		f, err := os.Open(fullPath)
		if err != nil {
			os.Remove(fullPath)
			fileResult.Success = false
			fileResult.Error = "读取文件失败"
			result.FailCount++
			continue
		}

		hash := md5.New()
		if _, err := io.Copy(hash, f); err != nil {
			f.Close()
			os.Remove(fullPath)
			fileResult.Success = false
			fileResult.Error = "计算MD5失败"
			result.FailCount++
			continue
		}
		f.Close()

		md5sum := hex.EncodeToString(hash.Sum(nil))

		// 获取图片信息
		imgFile, err := os.Open(fullPath)
		if err != nil {
			os.Remove(fullPath)
			fileResult.Success = false
			fileResult.Error = "读取图片失败"
			result.FailCount++
			continue
		}

		img, format, err := image.Decode(imgFile)
		imgFile.Close()
		if err != nil {
			os.Remove(fullPath)
			fileResult.Success = false
			fileResult.Error = "解析图片失败"
			result.FailCount++
			continue
		}

		// 获取图片尺寸
		bounds := img.Bounds()
		width := bounds.Max.X - bounds.Min.X
		height := bounds.Max.Y - bounds.Min.Y

		// 处理图片方向（如果是 JPEG）
		if format == "jpeg" {
			if correctedImg, rotated := s.correctImageOrientation(fullPath); rotated {
				// 如果图片被旋转，更新尺寸信息
				bounds = correctedImg.Bounds()
				width = bounds.Max.X - bounds.Min.X
				height = bounds.Max.Y - bounds.Min.Y
			}
		}

		// 创建文件记录
		fileModel := &model.File{
			ID:       fileID,
			Name:     file.Filename,
			Path:     fullPath,
			URL:      "/" + strings.ReplaceAll(filepath.Join(s.cfg.UploadDir, relativePath), "\\", "/"),
			Size:     file.Size,
			Type:     model.FileTypeImage,
			MimeType: file.Header.Get("Content-Type"),
			Width:    &width,
			Height:   &height,
			MD5:      md5sum,
			FolderID: folderID,
			UserID:   utils.GetUserIDFromContext(c),
		}

		if err := s.db.Create(fileModel).Error; err != nil {
			os.Remove(fullPath)
			fileResult.Success = false
			fileResult.Error = "保存文件记录失败"
			result.FailCount++
			continue
		}

		fileResult.Success = true
		fileResult.FileID = fileID
		fileResult.URL = fileModel.URL
		result.SuccessCount++
	}

	return result, nil
}

// correctImageOrientation 修正图片方向
func (s *UploadService) correctImageOrientation(imagePath string) (image.Image, bool) {
	// 打开原始图片
	src, err := imaging.Open(imagePath)
	if err != nil {
		return nil, false
	}

	// 检查是否需要旋转
	orientation := s.getImageOrientation(imagePath)
	if orientation == 1 {
		return src, false
	}

	// 根据方向值进行旋转
	var rotated image.Image
	switch orientation {
	case 3:
		rotated = imaging.Rotate180(src)
	case 6:
		rotated = imaging.Rotate270(src)
	case 8:
		rotated = imaging.Rotate90(src)
	default:
		return src, false
	}

	// 保存旋转后的图片
	err = imaging.Save(rotated, imagePath)
	if err != nil {
		return src, false
	}

	return rotated, true
}

// getImageOrientation 获取 JPEG 图片的 EXIF 方向信息
func (s *UploadService) getImageOrientation(imagePath string) int {
	f, err := os.Open(imagePath)
	if err != nil {
		return 1
	}
	defer f.Close()

	// 读取前 32KB 来检查 EXIF 信息
	buf := make([]byte, 32*1024)
	n, err := f.Read(buf)
	if err != nil && err != io.EOF {
		return 1
	}

	// 查找 EXIF 方向标记
	// EXIF 方向标记的格式为：FF E1 XX XX 45 78 69 66 00 00
	// 然后是 TIFF header，我们需要在其中查找方向值
	buf = buf[:n]
	for i := 0; i < len(buf)-2; i++ {
		if buf[i] == 0xFF && buf[i+1] == 0xE1 {
			if bytes.Equal(buf[i+4:i+10], []byte("Exif\x00\x00")) {
				// 找到 EXIF 标记，解析 TIFF header
				// 这里简化处理，实际应该完整解析 TIFF 结构
				// 通常方向值在偏移量为 0x0112 的位置
				for j := i + 10; j < len(buf)-1; j++ {
					if buf[j] == 0x01 && buf[j+1] == 0x12 {
						if j+9 < len(buf) {
							return int(buf[j+8])
						}
					}
				}
			}
			break
		}
	}

	return 1
}

// isImageType 检查是否是图片类型
func (s *UploadService) isImageType(ext string) bool {
	imageExts := []string{".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"}
	for _, e := range imageExts {
		if strings.EqualFold(ext, e) {
			return true
		}
	}
	return false
}

// getRotationAngle 根据 EXIF 方向获取旋转角度
func (s *UploadService) getRotationAngle(orientation int) int {
	switch orientation {
	case 3:
		return 180
	case 6:
		return 90
	case 8:
		return 270
	default:
		return 0
	}
}

// CheckFileExists 检查文件是否存在
func (s *UploadService) CheckFileExists(c *gin.Context, filename string, fileSize int64, folderID string) (bool, error) {
	var count int64
	err := s.db.Model(&model.File{}).
		Where("name = ? AND size = ? AND folder_id = ?", filename, fileSize, folderID).
		Count(&count).Error
	if err != nil {
		return false, fmt.Errorf("检查文件失败: %w", err)
	}
	return count > 0, nil
}

// GetUploadStatus 获取上传状态
func (s *UploadService) GetUploadStatus(c *gin.Context, fileID string) (*model.FileUploadStatus, error) {
	if fileID == "" {
		return nil, fmt.Errorf("文件ID不能为空")
	}

	uploadInfo, err := s.getUploadInfo(fileID)
	if err != nil {
		return &model.FileUploadStatus{
			Status: "not_found",
		}, nil
	}

	// 检查实际文件系统中的分片
	chunkDir := filepath.Join(s.cfg.Path, s.cfg.TempDir, fileID)
	chunks := make([]int, uploadInfo.ChunkCount)
	
	// 先从文件系统读取实际分片状态
	files, err := os.ReadDir(chunkDir)
	if err == nil {
		for _, file := range files {
			if !file.IsDir() {
				chunkNum, err := strconv.Atoi(file.Name())
				if err != nil {
					continue
				}
				if chunkNum >= 0 && chunkNum < uploadInfo.ChunkCount {
					// 检查文件大小是否正确
					fileInfo, err := file.Info()
					if err != nil {
						continue
					}
					
					expectedSize := uploadInfo.ChunkSize
					if chunkNum == uploadInfo.ChunkCount-1 {
						expectedSize = uploadInfo.Size - int64(chunkNum)*uploadInfo.ChunkSize
					}
					
					if fileInfo.Size() == expectedSize {
						chunks[chunkNum] = 1
					}
				}
			}
		}
	}

	// 更新 Redis 中的分片状态
	uploadInfo.Chunks = chunks
	if err := s.saveUploadInfo(fileID, uploadInfo); err != nil {
		s.logger.Error("更新分片状态失败",
			zap.String("fileID", fileID),
			zap.Error(err),
		)
	}

	// 计算已上传大小
	uploadedSize := int64(0)
	for i, status := range chunks {
		if status == 1 {
			if i == uploadInfo.ChunkCount-1 {
				uploadedSize += uploadInfo.Size - int64(i)*uploadInfo.ChunkSize
			} else {
				uploadedSize += uploadInfo.ChunkSize
			}
		}
	}

	return &model.FileUploadStatus{
		FileID:       fileID,
		Status:       uploadInfo.Status,
		TotalSize:    uploadInfo.Size,
		UploadedSize: uploadedSize,
		ChunkSize:    uploadInfo.ChunkSize,
		ChunksCount:  uploadInfo.ChunkCount,
		Chunks:       chunks,
		Progress:     float64(uploadedSize) / float64(uploadInfo.Size) * 100,
		LastUpdated:  uploadInfo.UpdatedAt.Unix(),
		Error: uploadInfo.ErrorMessage,
	}, nil
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
