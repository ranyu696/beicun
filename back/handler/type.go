package handler

import (
	"beicun/back/service"
	"beicun/back/utils"

	"github.com/gin-gonic/gin"
)

type TypeHandler struct {
	typeService *service.TypeService
	typeName    string
}

// NewUtilityTypeHandler 创建器具类型处理器
func NewUtilityTypeHandler(typeService *service.TypeService) *TypeHandler {
	return &TypeHandler{
		typeService: typeService,
		typeName:    "器具类型",
	}
}

// NewProductTypeHandler 创建产品类型处理器
func NewProductTypeHandler(typeService *service.TypeService) *TypeHandler {
	return &TypeHandler{
		typeService: typeService,
		typeName:    "产品类型",
	}
}

// NewChannelTypeHandler 创建通道类型处理器
func NewChannelTypeHandler(typeService *service.TypeService) *TypeHandler {
	return &TypeHandler{
		typeService: typeService,
		typeName:    "通道类型",
	}
}

// NewMaterialTypeHandler 创建材料类型处理器
func NewMaterialTypeHandler(typeService *service.TypeService) *TypeHandler {
	return &TypeHandler{
		typeService: typeService,
		typeName:    "材料类型",
	}
}

// @Summary 创建类型
// @Description 创建一个新的类型
// @Tags 类型管理
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer 管理员令牌"
// @Param type body service.CreateTypeRequest true "类型信息"
// @Success 200 {object} utils.Response{data=service.TypeResponse}
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /admin/types [post]
func (h *TypeHandler) CreateType(c *gin.Context) {
	var req service.CreateTypeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, err.Error())
		return
	}

	typ, err := h.typeService.CreateType(c, &req)
	if err != nil {
		switch err {
		case service.ErrTypeExists:
			utils.ConflictError(c, h.typeName+"已存在")
		case service.ErrInvalidType:
			utils.ValidationError(c, "无效的"+h.typeName+"信息")
		default:
			utils.InternalError(c, err)
		}
		return
	}

	utils.Success(c, typ)
}

// @Summary 更新类型
// @Description 更新类型信息
// @Tags 类型管理
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer 管理员令牌"
// @Param id path string true "类型ID"
// @Param type body service.UpdateTypeRequest true "类型信息"
// @Success 200 {object} utils.Response{data=service.TypeResponse}
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /admin/types/{id} [put]
func (h *TypeHandler) UpdateType(c *gin.Context) {
	id := c.Param("id")
	var req service.UpdateTypeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, err.Error())
		return
	}

	typ, err := h.typeService.UpdateType(c, id, &req)
	if err != nil {
		switch err {
		case service.ErrTypeNotFound:
			utils.NotFoundError(c, h.typeName+"不存在")
		case service.ErrTypeExists:
			utils.ConflictError(c, h.typeName+"已存在")
		case service.ErrInvalidType:
			utils.ValidationError(c, "无效的"+h.typeName+"信息")
		default:
			utils.InternalError(c, err)
		}
		return
	}

	utils.Success(c, typ)
}

// @Summary 删除类型
// @Description 删除类型
// @Tags 类型管理
// @Produce json
// @Param Authorization header string true "Bearer 管理员令牌"
// @Param id path string true "类型ID"
// @Success 200 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /admin/types/{id} [delete]
func (h *TypeHandler) DeleteType(c *gin.Context) {
	id := c.Param("id")
	if err := h.typeService.DeleteType(c, id); err != nil {
		switch err {
		case service.ErrTypeNotFound:
			utils.NotFoundError(c, h.typeName+"不存在")
		default:
			utils.InternalError(c, err)
		}
		return
	}

	utils.Success(c, nil)
}

// @Summary 获取类型详情
// @Description 获取类型详细信息
// @Tags 类型管理
// @Produce json
// @Param id path string true "类型ID"
// @Success 200 {object} utils.Response{data=service.TypeResponse}
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /types/{id} [get]
func (h *TypeHandler) GetType(c *gin.Context) {
	id := c.Param("id")
	typ, err := h.typeService.GetType(c, id)
	if err != nil {
		switch err {
		case service.ErrTypeNotFound:
			utils.NotFoundError(c, h.typeName+"不存在")
		default:
			utils.InternalError(c, err)
		}
		return
	}

	utils.Success(c, typ)
}

// @Summary 获取类型列表
// @Description 获取类型列表
// @Tags 类型管理
// @Produce json
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页数量" default(10)
// @Success 200 {object} utils.Response{data=[]service.TypeResponse}
// @Failure 500 {object} utils.Response
// @Router /types [get]
func (h *TypeHandler) ListTypes(c *gin.Context) {
	page, pageSize := utils.GetPageInfo(c)
	types, total, err := h.typeService.ListTypes(c, page, pageSize)
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	utils.PageSuccess(c, types, total, page, pageSize)
}
