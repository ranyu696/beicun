package handler

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"beicun/back/model"
	"beicun/back/service"
	"beicun/back/utils"
)

// UploadHandler 上传处理器
type UploadHandler struct {
	uploadService *service.UploadService
	logger       *zap.Logger
}

// NewUploadHandler 创建上传处理器
func NewUploadHandler(uploadService *service.UploadService, logger *zap.Logger) *UploadHandler {
	return &UploadHandler{
		uploadService: uploadService,
		logger:       logger,
	}
}

// CheckUpload 检查文件是否存在
func (h *UploadHandler) CheckUpload(c *gin.Context) {
	var req struct {
		Name     string `json:"name" binding:"required"`
		Size     int64  `json:"size" binding:"required"`
		FolderID string `json:"folderId"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, err.Error())
		return
	}

	info := &model.FileUploadInfo{
		Name:     req.Name,
		Size:     req.Size,
		FolderID: req.FolderID,
	}

	result, err := h.uploadService.CheckUpload(c, info)
	if err != nil {
		utils.ServerError(c, err.Error())
		return
	}

	utils.Success(c, result)
}

// UploadChunk 上传分片
// @Summary 上传文件分片
// @Description 上传单个文件分片
// @Tags 上传
// @Accept multipart/form-data
// @Produce json
// @Param file_id query string true "文件ID"
// @Param chunk_num query int true "分片序号"
// @Param file formData file true "分片数据"
// @Success 200 {object} utils.Response
// @Failure 400 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/upload/chunk [post]
func (h *UploadHandler) UploadChunk(c *gin.Context) {
	// 获取URL参数
	fileID := c.Query("file_id")
	if fileID == "" {
		utils.ParamError(c, "缺少文件ID")
		return
	}

	chunkNumStr := c.Query("chunk_num")
	chunkNum, err := strconv.Atoi(chunkNumStr)
	if err != nil {
		utils.ParamError(c, "分片序号格式错误")
		return
	}

	// 获取分片文件
	chunkFile, err := c.FormFile("file")
	if err != nil {
		utils.ParamError(c, "获取分片文件失败: "+err.Error())
		return
	}

	// 转换为上传信息
	info := &model.UploadChunkInfo{
		FileID:   fileID,
		ChunkNum: chunkNum,
	}

	// 打开分片文件
	file, err := chunkFile.Open()
	if err != nil {
		utils.ServerError(c, "打开分片文件失败: "+err.Error())
		return
	}
	defer file.Close()

	// 上传分片
	if err := h.uploadService.UploadChunk(c, info, file); err != nil {
		utils.ServerError(c, "上传分片失败: "+err.Error())
		return
	}

	utils.Success(c, nil)
}

// GetUploadProgress 获取上传进度
// @Summary 获取上传进度
// @Description 获取文件上传进度
// @Tags 上传
// @Accept json
// @Produce json
// @Param fileId query string true "文件ID"
// @Success 200 {object} utils.Response{data=model.FileUploadInfo}
// @Failure 400 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/upload/progress [get]
func (h *UploadHandler) GetUploadProgress(c *gin.Context) {
	fileID := c.Query("fileId")
	if fileID == "" {
		utils.ParamError(c, "缺少文件ID")
		return
	}

	status, err := h.uploadService.GetUploadStatus(c, fileID)
	if err != nil {
		utils.ServerError(c, "获取上传状态失败: "+err.Error())
		return
	}

	utils.Success(c, status)
}

// BatchUploadImages 批量上传图片
// @Summary 批量上传图片
// @Description 批量上传图片，支持多个图片同时上传
// @Tags 上传
// @Accept multipart/form-data
// @Produce json
// @Param files formData file true "图片文件列表"
// @Param folderId formData string true "文件夹ID"
// @Success 200 {object} utils.Response{data=model.BatchUploadResult}
// @Failure 400 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/upload/images [post]
func (h *UploadHandler) BatchUploadImages(c *gin.Context) {
	form, err := c.MultipartForm()
	if err != nil {
		utils.ParamError(c, "获取表单数据失败: "+err.Error())
		return
	}

	files := form.File["files"]
	if len(files) == 0 {
		utils.ParamError(c, "未选择要上传的图片")
		return
	}

	// 验证文件大小和类型
	for _, file := range files {
		if file.Size > 10*1024*1024 { // 10MB
			utils.ParamError(c, fmt.Sprintf("图片 %s 大小超过10MB限制", file.Filename))
			return
		}

		contentType := file.Header.Get("Content-Type")
		if !strings.HasPrefix(contentType, "image/") {
			utils.ParamError(c, fmt.Sprintf("文件 %s 不是图片类型", file.Filename))
			return
		}
	}

	folderID := c.PostForm("folder_id")
	if folderID == "" {
		utils.ParamError(c, "缺少文件夹ID")
		return
	}

	results, err := h.uploadService.BatchUploadImages(c, files, folderID)
	if err != nil {
		utils.ServerError(c, "上传失败: "+err.Error())
		return
	}

	utils.Success(c, results)
}

// InitUpload 初始化上传
func (h *UploadHandler) InitUpload(c *gin.Context) {
	var info model.FileUploadInfo
	if err := c.ShouldBindJSON(&info); err != nil {
		h.logger.Error("解析请求参数失败", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    1,
			"message": "无效的请求参数",
		})
		return
	}

	// 初始化上传信息
	if err := h.uploadService.InitUpload(c, &info); err != nil {
		h.logger.Error("初始化上传失败", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    1,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "初始化成功",
		"data": gin.H{
			"success": true,
		},
	})
}
