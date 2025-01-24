package handler

import (
	"beicun/back/service"
	"beicun/back/utils"

	"github.com/gin-gonic/gin"
)

type CommentHandler struct {
	commentService *service.CommentService
}

func NewCommentHandler(commentService *service.CommentService) *CommentHandler {
	return &CommentHandler{commentService: commentService}
}

// @Summary 创建评论
// @Description 创建一个新的评论
// @Tags 评论
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer 用户令牌"
// @Param comment body service.CreateCommentRequest true "评论信息"
// @Success 200 {object} utils.Response{data=service.CommentResponse}
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /comments [post]
func (h *CommentHandler) CreateComment(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)
	if userID == "" {
		utils.UnauthorizedError(c)
		return
	}

	var req service.CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, err.Error())
		return
	}

	comment, err := h.commentService.CreateComment(c, userID, &req)
	if err != nil {
		switch err {
		case service.ErrReviewNotFound:
			utils.NotFoundError(c, err.Error())
		case service.ErrCommentNotFound:
			utils.NotFoundError(c, err.Error())
		case service.ErrInvalidComment:
			utils.ValidationError(c, err.Error())
		default:
			utils.InternalError(c, err)
		}
		return
	}

	utils.Success(c, comment)
}

// @Summary 更新评论
// @Description 更新评论内容
// @Tags 评论
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer 用户令牌"
// @Param id path string true "评论ID"
// @Param comment body service.UpdateCommentRequest true "评论信息"
// @Success 200 {object} utils.Response{data=service.CommentResponse}
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /comments/{id} [put]
func (h *CommentHandler) UpdateComment(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)
	if userID == "" {
		utils.UnauthorizedError(c)
		return
	}

	id := c.Param("id")
	var req service.UpdateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, err.Error())
		return
	}

	comment, err := h.commentService.UpdateComment(c, id, userID, &req)
	if err != nil {
		switch err {
		case service.ErrCommentNotFound:
			utils.NotFoundError(c, err.Error())
		default:
			utils.InternalError(c, err)
		}
		return
	}

	utils.Success(c, comment)
}

// @Summary 更新评论状态
// @Description 管理员更新评论状态（通过/拒绝）
// @Tags 评论
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer 管理员令牌"
// @Param id path string true "评论ID"
// @Param status body service.UpdateCommentStatusRequest true "状态信息"
// @Success 200 {object} utils.Response{data=service.CommentResponse}
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /comments/{id}/status [put]
func (h *CommentHandler) UpdateCommentStatus(c *gin.Context) {
	id := c.Param("id")
	var req service.UpdateCommentStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ParamError(c, err.Error())
		return
	}

	comment, err := h.commentService.UpdateCommentStatus(c, id, &req)
	if err != nil {
		switch err {
		case service.ErrCommentNotFound:
			utils.NotFoundError(c, err.Error())
		default:
			utils.InternalError(c, err)
		}
		return
	}

	utils.Success(c, comment)
}

// @Summary 删除评论
// @Description 删除评论
// @Tags 评论
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer 用户令牌"
// @Param id path string true "评论ID"
// @Success 200 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /comments/{id} [delete]
func (h *CommentHandler) DeleteComment(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)
	if userID == "" {
		utils.UnauthorizedError(c)
		return
	}

	id := c.Param("id")
	if err := h.commentService.DeleteComment(c, id, userID); err != nil {
		switch err {
		case service.ErrCommentNotFound:
			utils.NotFoundError(c, err.Error())
		default:
			utils.InternalError(c, err)
		}
		return
	}

	utils.Success(c, nil)
}

// @Summary 获取评论详情
// @Description 获取单个评论的详细信息
// @Tags 评论
// @Produce json
// @Param id path string true "评论ID"
// @Success 200 {object} utils.Response{data=service.CommentResponse}
// @Failure 404 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /comments/{id} [get]
func (h *CommentHandler) GetComment(c *gin.Context) {
	id := c.Param("id")
	comment, err := h.commentService.GetComment(c, id)
	if err != nil {
		switch err {
		case service.ErrCommentNotFound:
			utils.NotFoundError(c, err.Error())
		default:
			utils.InternalError(c, err)
		}
		return
	}

	utils.Success(c, comment)
}

// ListComments 获取评论列表
// @Summary 获取评论列表
// @Description 获取指定测评的评论列表
// @Tags 评论管理
// @Accept json
// @Produce json
// @Param review_slug query string true "测评 Slug"
// @Param page query int false "页码，默认为1"
// @Param pageSize query int false "每页数量，默认为10"
// @Param status query string false "评论状态"
// @Success 200 {object} utils.Response{data=[]service.CommentResponse}
// @Failure 400,404,500 {object} utils.Response
// @Router /comments [get]
func (h *CommentHandler) ListComments(c *gin.Context) {
	reviewSlug := c.Query("review_slug")
	if reviewSlug == "" {
		utils.ParamError(c, "测评 Slug 不能为空")
		return
	}

	page, pageSize := utils.GetPageInfo(c)
	status := c.Query("status")

	comments, total, err := h.commentService.ListComments(c, reviewSlug, page, pageSize, status)
	if err != nil {
		switch err {
		case service.ErrReviewNotFound:
			utils.NotFoundError(c, "测评不存在")
		default:
			utils.InternalError(c, err)
		}
		return
	}

	utils.PageSuccess(c, comments, total, page, pageSize)
}

// @Summary 获取所有评论列表（管理员）
// @Description 管理员获取所有评论列表
// @Tags 评论
// @Produce json
// @Param Authorization header string true "Bearer 管理员令牌"
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页数量" default(10)
// @Param status query string false "状态过滤" Enums(PENDING, PUBLISHED, REJECTED)
// @Success 200 {object} utils.Response{data=[]service.CommentResponse}
// @Failure 401 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /admin/comments [get]
func (h *CommentHandler) ListAllComments(c *gin.Context) {
	page, pageSize := utils.GetPageInfo(c)
	status := c.Query("status")

	comments, total, err := h.commentService.ListAllComments(c, page, pageSize, status)
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	utils.PageSuccess(c, comments, total, page, pageSize)
}
