package service

import (
	"beicun/back/config"
	"beicun/back/model"
	"beicun/back/utils"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrEmailExists        = errors.New("email already exists")
	ErrUserNotFound       = errors.New("user not found")
	ErrInvalidToken       = errors.New("invalid token")
	ErrInvalidTurnstile   = errors.New("invalid turnstile token")
)

type AuthService struct {
	userService  *UserService
	jwtSecret    []byte
	cfg          *config.Config
	captchaService *CaptchaService
}

type TurnstileResponse struct {
	Success    bool     `json:"success"`
	ErrorCodes []string `json:"error-codes"`
}

func NewAuthService(userService *UserService, captchaService *CaptchaService, cfg *config.Config) *AuthService {
	return &AuthService{
		userService:  userService,
		jwtSecret:    []byte(cfg.JWT.Secret),
		cfg:          cfg,
		captchaService: captchaService,
	}
}

type LoginRequest struct {
	Email         string `json:"email" binding:"required,email"`
	Password      string `json:"password" binding:"required"`
	TurnstileToken string `json:"turnstileToken" binding:"required"`
}

type RegisterRequest struct {
	Email          string `json:"email" binding:"required,email"`
	Password       string `json:"password" binding:"required,min=6"`
	Name           string `json:"name" binding:"required"`
	TurnstileToken string `json:"turnstileToken" binding:"required"`
	VerifyCode     string `json:"verifyCode" binding:"required"`
}

type TokenResponse struct {
	AccessToken  string      `json:"accessToken"`
	RefreshToken string      `json:"refreshToken"`
	ExpiresAt    time.Time   `json:"expiresAt"`
	User         *model.User `json:"user"`
}

// 验证 Turnstile token
func (s *AuthService) verifyTurnstile(token string) error {
	// 检查配置
	if s.cfg.Turnstile.SecretKey == "" {
		return errors.New("turnstile secret key is not configured")
	}

	// 准备请求数据
	data := url.Values{}
	data.Set("secret", s.cfg.Turnstile.SecretKey)
	data.Set("response", token)

	// 创建 HTTP 客户端
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	// 发送请求
	verifyURL := "https://challenges.cloudflare.com/turnstile/v0/siteverify"
	if s.cfg.Turnstile.VerifyURL != "" {
		verifyURL = s.cfg.Turnstile.VerifyURL
	}

	resp, err := client.PostForm(verifyURL, data)
	if err != nil {
		return fmt.Errorf("failed to verify turnstile token: %v", err)
	}
	defer resp.Body.Close()

	// 解析响应
	var result TurnstileResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return fmt.Errorf("failed to decode turnstile response: %v", err)
	}

	// 检查验证结果
	if !result.Success {
		if len(result.ErrorCodes) > 0 {
			return fmt.Errorf("turnstile verification failed: %v", result.ErrorCodes[0])
		}
		return ErrInvalidTurnstile
	}

	return nil
}

func (s *AuthService) Login(c *gin.Context, req *LoginRequest) (*TokenResponse, error) {
	// 1. 验证 Turnstile token
	if err := s.verifyTurnstile(req.TurnstileToken); err != nil {
		return nil, err
	}

	// 2. 查找用户
	user, err := s.userService.GetUserByEmail(c, req.Email)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	// 3. 验证密码 (加入盐值)
	saltedPassword := []byte(req.Password + user.Salt)
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), saltedPassword); err != nil {
		return nil, ErrInvalidCredentials
	}

	// 4. 生成访问令牌
	accessToken, err := utils.GenerateToken(user, s.jwtSecret)
	if err != nil {
		utils.LogError("生成访问令牌失败", err)
		return nil, errors.New("生成令牌失败")
	}

	// 5. 生成刷新令牌
	refreshToken, err := utils.GenerateRefreshToken(user, s.jwtSecret)
	if err != nil {
		utils.LogError("生成刷新令牌失败", err)
		return nil, errors.New("生成令牌失败")
	}

	// 6. 更新最后登录时间
	updates := map[string]interface{}{
		"last_login_at": time.Now(),
	}
	if _, err := s.userService.UpdateUser(c, user.ID, updates); err != nil {
		utils.LogError("更新最后登录时间失败", err)
	}

	return &TokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    time.Now().Add(24 * time.Hour),
		User:         user,
	}, nil
}

func (s *AuthService) Register(c *gin.Context, req *RegisterRequest) (*TokenResponse, error) {
	// 1. 验证 Turnstile token
	if err := s.verifyTurnstile(req.TurnstileToken); err != nil {
		return nil, err
	}

	// 2. 验证邮箱验证码
	isValid, err := s.captchaService.ValidateEmailCaptcha(c, req.Email, req.VerifyCode, CaptchaTypeRegister)
	if err != nil {
		return nil, fmt.Errorf("验证码验证失败: %v", err)
	}
	if !isValid {
		return nil, errors.New("验证码错误或已过期")
	}

	// 3. 检查邮箱是否已存在
	if _, err := s.userService.GetUserByEmail(c, req.Email); err == nil {
		return nil, ErrEmailExists
	}

	// 4. 生成随机盐值
	salt := utils.GenerateRandomString(32)

	// 5. 加密密码（加入盐值）
	saltedPassword := []byte(req.Password + salt)
	hashedPassword, err := bcrypt.GenerateFromPassword(saltedPassword, bcrypt.DefaultCost)
	if err != nil {
		utils.LogError("密码加密失败", err)
		return nil, errors.New("注册失败")
	}

	// 6. 创建用户
	user := &model.User{
		Email:    req.Email,
		Password: string(hashedPassword),
		Salt:     salt,
		Name:     req.Name,
		Role:     model.UserRoleUser,
		Status:   model.UserStatusActive,
	}

	if err := s.userService.CreateUser(c, user); err != nil {
		utils.LogError("创建用户失败", err)
		return nil, errors.New("注册失败")
	}

	// 7. 生成访问令牌
	accessToken, err := utils.GenerateToken(user, s.jwtSecret)
	if err != nil {
		utils.LogError("生成访问令牌失败", err)
		return nil, errors.New("注册成功但生成令牌失败")
	}

	// 8. 生成刷新令牌
	refreshToken, err := utils.GenerateRefreshToken(user, s.jwtSecret)
	if err != nil {
		utils.LogError("生成刷新令牌失败", err)
		return nil, errors.New("注册成功但生成令牌失败")
	}

	return &TokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    time.Now().Add(24 * time.Hour),
		User:         user,
	}, nil
}

func (s *AuthService) SendRegisterCode(c *gin.Context, email string) error {
	// 1. 检查邮箱是否已存在
	if _, err := s.userService.GetUserByEmail(c, email); err == nil {
		return ErrEmailExists
	}

	// 2. 发送验证码
	if err := s.captchaService.SendEmailCaptcha(c, email, CaptchaTypeRegister); err != nil {
		return fmt.Errorf("发送验证码失败: %v", err)
	}

	return nil
}

func (s *AuthService) ValidateToken(tokenString string) (*jwt.Token, error) {
	return jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("无效的token签名方法")
		}
		return s.jwtSecret, nil
	})
}

func (s *AuthService) GetUserFromToken(c *gin.Context, claims *utils.Claims) (*model.User, error) {
	if claims == nil {
		return nil, errors.New("无效的token claims")
	}

	user, err := s.userService.GetUser(c, claims.UserID)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (s *AuthService) ChangePassword(c *gin.Context, userID, oldPassword, newPassword string) error {
	// 1. 获取用户
	user, err := s.userService.GetUser(c, userID)
	if err != nil {
		return err
	}

	// 2. 验证旧密码（加入盐值）
	saltedOldPassword := []byte(oldPassword + user.Salt)
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), saltedOldPassword); err != nil {
		return errors.New("旧密码错误")
	}

	// 3. 生成新的随机盐值
	newSalt := utils.GenerateRandomString(32)

	// 4. 加密新密码（加入新盐值）
	saltedNewPassword := []byte(newPassword + newSalt)
	hashedPassword, err := bcrypt.GenerateFromPassword(saltedNewPassword, bcrypt.DefaultCost)
	if err != nil {
		utils.LogError("密码加密失败", err)
		return errors.New("修改密码失败")
	}

	// 5. 更新密码和盐值
	updates := map[string]interface{}{
		"password": string(hashedPassword),
		"salt":     newSalt,
	}
	_, err = s.userService.UpdateUser(c, userID, updates)
	if err != nil {
		utils.LogError("更新密码失败", err)
		return errors.New("修改密码失败")
	}

	return nil
}

func (s *AuthService) ResetPassword(c *gin.Context, userID string) (string, error) {
	// 1. 生成随机密码
	newPassword := utils.GenerateRandomPassword()

	// 2. 生成新的随机盐值
	newSalt := utils.GenerateRandomString(32)

	// 3. 加密新密码（加入新盐值）
	saltedPassword := []byte(newPassword + newSalt)
	hashedPassword, err := bcrypt.GenerateFromPassword(saltedPassword, bcrypt.DefaultCost)
	if err != nil {
		utils.LogError("密码加密失败", err)
		return "", errors.New("重置密码失败")
	}

	// 4. 更新密码和盐值
	updates := map[string]interface{}{
		"password": string(hashedPassword),
		"salt":     newSalt,
	}
	_, err = s.userService.UpdateUser(c, userID, updates)
	if err != nil {
		utils.LogError("更新密码失败", err)
		return "", errors.New("重置密码失败")
	}

	return newPassword, nil
}

func (s *AuthService) RefreshToken(c *gin.Context, refreshToken string) (*TokenResponse, error) {
	// 1. 解析刷新令牌
	claims, err := utils.ParseToken(refreshToken, s.jwtSecret)
	if err != nil {
		return nil, errors.New("无效的刷新令牌")
	}

	// 2. 获取用户
	user, err := s.userService.GetUser(c, claims.UserID)
	if err != nil {
		return nil, errors.New("用户不存在")
	}

	// 3. 生成新的访问令牌
	accessToken, err := utils.GenerateToken(user, s.jwtSecret)
	if err != nil {
		utils.LogError("生成访问令牌失败", err)
		return nil, errors.New("刷新令牌失败")
	}

	// 4. 生成新的刷新令牌
	newRefreshToken, err := utils.GenerateRefreshToken(user, s.jwtSecret)
	if err != nil {
		utils.LogError("生成刷新令牌失败", err)
		return nil, errors.New("刷新令牌失败")
	}

	return &TokenResponse{
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
		ExpiresAt:    time.Now().Add(24 * time.Hour),
		User:         user,
	}, nil
}
