package handler

import (
	"strconv"

	"github.com/gin-gonic/gin"

	"beicun/back/config"
	"beicun/back/service"
	"beicun/back/utils"
)

type StorageHandler struct {
	storageService *service.StorageService
	cfg            *config.Config
}

func NewStorageHandler(storageService *service.StorageService, cfg *config.Config) *StorageHandler {
	return &StorageHandler{
		storageService: storageService,
		cfg:            cfg,
	}
}



// @Summary 创建文件夹
// @Description 创建新的文件夹
// @Tags 文件夹
// @Accept json
// @Produce json
// @Param request body service.CreateFolderRequest true "创建文件夹请求"
// @Success 200 {object} utils.Response{data=model.Folder}
// @Failure 400 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/folders [post]
func (h *StorageHandler) CreateFolder(c *gin.Context) {
	var req service.CreateFolderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, err.Error())
		return
	}

	folder, err := h.storageService.CreateFolder(c, &req)
	if err != nil {
		switch err {
		case service.ErrFolderNotFound:
			utils.NotFoundError(c, err.Error())
		default:
			utils.ServerError(c, err.Error())
		}
		return
	}

	utils.Success(c, folder)
}

// @Summary 更新文件夹
// @Description 更新文件夹信息
// @Tags 文件夹
// @Accept json
// @Produce json
// @Param id path string true "文件夹ID"
// @Param request body service.UpdateFolderRequest true "更新文件夹请求"
// @Success 200 {object} utils.Response{data=model.Folder}
// @Failure 400 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/folders/{id} [patch]
func (h *StorageHandler) UpdateFolder(c *gin.Context) {
	id := c.Param("id")
	var req service.UpdateFolderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, err.Error())
		return
	}

	folder, err := h.storageService.UpdateFolder(c, id, &req)
	if err != nil {
		switch err {
		case service.ErrFolderNotFound:
			utils.NotFoundError(c, err.Error())
		default:
			utils.ServerError(c, err.Error())
		}
		return
	}

	utils.Success(c, folder)
}

// @Summary 移动文件夹
// @Description 移动文件夹到新的位置
// @Tags 文件夹
// @Accept json
// @Produce json
// @Param id path string true "文件夹ID"
// @Param target_parent_id query string false "目标父文件夹ID"
// @Success 200 {object} utils.Response
// @Failure 400 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/folders/{id}/move [post]
func (h *StorageHandler) MoveFolder(c *gin.Context) {
	id := c.Param("id")
	var targetParentID *string
	if id := c.Query("target_parent_id"); id != "" {
		targetParentID = &id
	}

	err := h.storageService.MoveFolder(c, id, targetParentID)
	if err != nil {
		switch err {
		case service.ErrFolderNotFound:
			utils.NotFoundError(c, err.Error())
		case service.ErrSameFolder:
			utils.ValidationError(c, err.Error())
		case service.ErrParentFolder:
			utils.ValidationError(c, err.Error())
		default:
			utils.ServerError(c, err.Error())
		}
		return
	}

	utils.Success(c, nil)
}

// @Summary 删除文件夹
// @Description 删除文件夹及其内容
// @Tags 文件夹
// @Accept json
// @Produce json
// @Param id path string true "文件夹ID"
// @Success 200 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/folders/{id} [delete]
func (h *StorageHandler) DeleteFolder(c *gin.Context) {
	id := c.Param("id")

	err := h.storageService.DeleteFolder(c, id)
	if err != nil {
		switch err {
		case service.ErrFolderNotFound:
			utils.NotFoundError(c, err.Error())
		default:
			utils.ServerError(c, err.Error())
		}
		return
	}

	utils.Success(c, nil)
}

// @Summary 获取文件夹信息
// @Description 获取文件夹详细信息
// @Tags 文件夹
// @Accept json
// @Produce json
// @Param id path string true "文件夹ID"
// @Success 200 {object} utils.Response{data=model.Folder}
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/folders/{id} [get]
func (h *StorageHandler) GetFolder(c *gin.Context) {
	id := c.Param("id")

	folder, err := h.storageService.GetFolder(c, id)
	if err != nil {
		switch err {
		case service.ErrFolderNotFound:
			utils.NotFoundError(c, err.Error())
		default:
			utils.ServerError(c, err.Error())
		}
		return
	}

	utils.Success(c, folder)
}

// @Summary 获取文件夹列表
// @Description 获取文件夹列表
// @Tags 文件夹
// @Accept json
// @Produce json
// @Param parent_id query string false "父文件夹ID"
// @Param page query int false "页码" default(1)
// @Param pageSize query int false "每页数量" default(10)
// @Success 200 {object} utils.Response{data=[]model.Folder,total=int64}
// @Failure 500 {object} utils.Response
// @Router /api/folders [get]
func (h *StorageHandler) ListFolders(c *gin.Context) {
	// 获取分页参数
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	parentId := c.Query("parentId")

	var parentIdPtr *string
	if parentId != "" {
		parentIdPtr = &parentId
	}

	// 获取文件夹列表
	folders, total, err := h.storageService.ListFolders(c, parentIdPtr, page, pageSize)
	if err != nil {
		utils.ServerError(c, err.Error())
		return
	}

	utils.SuccessWithTotal(c, folders, total)
}

// @Summary 移动文件
// @Description 移动文件到新的文件夹
// @Tags 文件
// @Accept json
// @Produce json
// @Param id path string true "文件ID"
// @Param request body struct { FolderID string "json:\"folderId\"" } true "移动文件请求"
// @Success 200 {object} utils.Response
// @Failure 400 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/files/{id}/move [post]
func (h *StorageHandler) MoveFile(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		utils.ParamError(c, "文件ID不能为空")
		return
	}

	var req struct {
		FolderID string `json:"folderId"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, "无效的请求参数")
		return
	}

	if err := h.storageService.MoveFile(c, id, req.FolderID); err != nil {
		utils.ServerError(c, err.Error())
		return
	}

	utils.Success(c, nil)
}

// @Summary 删除文件
// @Description 删除文件
// @Tags 文件
// @Accept json
// @Produce json
// @Param id path string true "文件ID"
// @Success 200 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/files/{id} [delete]
func (h *StorageHandler) DeleteFile(c *gin.Context) {
	id := c.Param("id")

	err := h.storageService.DeleteFile(c, id)
	if err != nil {
		switch err {
		case service.ErrFileNotFound:
			utils.NotFoundError(c, err.Error())
		default:
			utils.ServerError(c, err.Error())
		}
		return
	}

	utils.Success(c, nil)
}

// @Summary 获取文件信息
// @Description 获取文件详细信息
// @Tags 文件
// @Accept json
// @Produce json
// @Param id path string true "文件ID"
// @Success 200 {object} utils.Response{data=model.File}
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /api/files/{id} [get]
func (h *StorageHandler) GetFile(c *gin.Context) {
	id := c.Param("id")

	file, err := h.storageService.GetFile(c, id)
	if err != nil {
		switch err {
		case service.ErrFileNotFound:
			utils.NotFoundError(c, err.Error())
		default:
			utils.ServerError(c, err.Error())
		}
		return
	}

	utils.Success(c, file)
}

// @Summary 获取文件列表
// @Description 获取文件列表
// @Tags 文件
// @Accept json
// @Produce json
// @Param folder_id query string false "文件夹ID"
// @Param type query string false "文件类型" Enums(image, video, other)
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页数量" default(10)
// @Success 200 {object} utils.Response{data=[]model.File,total=int64}
// @Failure 500 {object} utils.Response
// @Router /api/files [get]
func (h *StorageHandler) ListFiles(c *gin.Context) {
	// 获取分页参数
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	folderId := c.Query("folderId")
	fileType := c.Query("type")

	var folderIdPtr *string
	if folderId != "" {
		folderIdPtr = &folderId
	}

	// 获取文件列表
	files, total, err := h.storageService.ListFiles(c, folderIdPtr, fileType, page, pageSize)
	if err != nil {
		utils.ServerError(c, err.Error())
		return
	}

	utils.SuccessWithTotal(c, files, total)
}

// @Summary 获取存储统计信息
// @Description 获取存储统计信息，包括文件数量、存储大小等
// @Tags 存储
// @Accept json
// @Produce json
// @Success 200 {object} utils.Response{data=service.StorageStats}
// @Failure 500 {object} utils.Response
// @Router /api/storage/stats [get]
func (h *StorageHandler) GetStorageStats(c *gin.Context) {
	stats, err := h.storageService.GetStorageStats(c)
	if err != nil {
		utils.ServerError(c, err.Error())
		return
	}

	utils.Success(c, gin.H{
		"totalFiles":   stats.TotalFiles,
		"totalFolders": stats.TotalFolders,
		"usedSpace":    stats.TotalSize,
		"freeSpace":    h.cfg.Storage.MaxFileSize - stats.TotalSize,
	})
}
