package service

import (
	"fmt"
	"log"
	"math/rand"
	"net/mail"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

const (
	// 验证码长度
	captchaLength = 6
	// 验证码有效期（分钟）
	captchaExpiration = 10
	// Redis key 前缀
	captchaKeyPrefix = "captcha:"
)

type CaptchaType string

const (
	CaptchaTypeRegister      CaptchaType = "register"
	CaptchaTypeResetPassword CaptchaType = "reset_password"
	CaptchaTypeChangeEmail   CaptchaType = "change_email"
)

// CaptchaService 验证码服务
type CaptchaService struct {
	emailService *EmailService
	redis       *redis.Client
}

// NewCaptchaService 创建验证码服务实例
func NewCaptchaService(emailService *EmailService, redis *redis.Client) *CaptchaService {
	return &CaptchaService{
		emailService: emailService,
		redis:       redis,
	}
}

// generateCode 生成6位数字验证码
func (s *CaptchaService) generateCode() string {
	rand.Seed(time.Now().UnixNano())
	code := fmt.Sprintf("%06d", rand.Intn(1000000))
	log.Printf("生成验证码: %s\n", code)
	return code
}

// validateEmail 验证邮箱格式
func (s *CaptchaService) validateEmail(email string) bool {
	_, err := mail.ParseAddress(email)
	log.Printf("邮箱格式验证结果: %v\n", err == nil)
	return err == nil
}

// SendEmailCaptcha 发送邮箱验证码
func (s *CaptchaService) SendEmailCaptcha(c *gin.Context, email string, captchaType CaptchaType) error {
	log.Printf("开始发送验证码到邮箱: %s, 类型: %s\n", email, captchaType)

	// 验证邮箱格式
	if !s.validateEmail(email) {
		log.Printf("邮箱格式不正确: %s\n", email)
		return fmt.Errorf("邮箱格式不正确")
	}

	// 检查发送频率限制
	key := fmt.Sprintf("captcha:limit:%s:%s", captchaType, email)
	exists, err := s.redis.Exists(c, key).Result()
	if err != nil {
		log.Printf("检查发送频率失败: %v\n", err)
		return fmt.Errorf("检查发送频率失败: %v", err)
	}
	if exists == 1 {
		log.Printf("发送太频繁: %s\n", email)
		return fmt.Errorf("发送太频繁，请稍后再试")
	}

	// 生成验证码
	code := s.generateCode()

	// 保存验证码到Redis
	codeKey := fmt.Sprintf("captcha:code:%s:%s", captchaType, email)
	if err := s.redis.Set(c, codeKey, code, captchaExpiration*time.Minute).Err(); err != nil {
		log.Printf("保存验证码失败: %v\n", err)
		return fmt.Errorf("保存验证码失败: %v", err)
	}

	// 设置发送频率限制
	if err := s.redis.Set(c, key, 1, time.Minute).Err(); err != nil {
		log.Printf("设置发送频率限制失败: %v\n", err)
		return fmt.Errorf("设置发送频率限制失败: %v", err)
	}

	// 发送验证码邮件
	if err := s.emailService.SendVerificationCode(email, code, string(captchaType)); err != nil {
		log.Printf("发送验证码邮件失败: %v\n", err)
		return fmt.Errorf("发送验证码邮件失败: %v", err)
	}

	log.Printf("验证码发送成功到: %s\n", email)
	return nil
}

// ValidateEmailCaptcha 验证邮箱验证码
func (s *CaptchaService) ValidateEmailCaptcha(c *gin.Context, email string, code string, captchaType CaptchaType) (bool, error) {
	log.Printf("开始验证验证码: email=%s, code=%s, type=%s\n", email, code, captchaType)

	key := fmt.Sprintf("captcha:code:%s:%s", captchaType, email)
	storedCode, err := s.redis.Get(c, key).Result()
	if err != nil {
		if err == redis.Nil {
			log.Printf("验证码已过期或不存在: %s\n", email)
			return false, fmt.Errorf("验证码已过期或不存在")
		}
		log.Printf("验证验证码失败: %v\n", err)
		return false, fmt.Errorf("验证验证码失败: %v", err)
	}

	if storedCode != code {
		log.Printf("验证码不正确: expected=%s, got=%s\n", storedCode, code)
		return false, fmt.Errorf("验证码不正确")
	}

	// 验证成功后删除验证码
	if err := s.redis.Del(c, key).Err(); err != nil {
		log.Printf("删除验证码失败: %v\n", err)
		return false, fmt.Errorf("删除验证码失败: %v", err)
	}

	log.Printf("验证码验证成功: %s\n", email)
	return true, nil
}
