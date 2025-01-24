package service

import (
	"beicun/back/config"
	"crypto/tls"
	"fmt"
	"github.com/wneessen/go-mail"
	"log"
	"time"
)

// EmailService 邮件服务
type EmailService struct {
	cfg *config.Config
}

// NewEmailService 创建邮件服务实例
func NewEmailService(config *config.Config) *EmailService {
	return &EmailService{
		cfg: config,
	}
}

// SendEmail 发送邮件
func (s *EmailService) SendEmail(to []string, subject, content string) error {
	log.Printf("开始发送邮件到 %v\n", to)
	log.Printf("邮件配置: Host=%s, Port=%d, User=%s, From=%s\n", 
		s.cfg.Email.Host, 
		s.cfg.Email.Port, 
		s.cfg.Email.User,
		s.cfg.Email.From,
	)

	// 创建邮件客户端
	m := mail.NewMsg()
	if err := m.From(s.cfg.Email.From); err != nil {
		log.Printf("设置发件人失败: %v\n", err)
		return fmt.Errorf("设置发件人失败: %v", err)
	}
	if err := m.To(to...); err != nil {
		log.Printf("设置收件人失败: %v\n", err)
		return fmt.Errorf("设置收件人失败: %v", err)
	}

	m.Subject(subject)
	m.SetBodyString(mail.TypeTextHTML, content)

	// TLS配置
	tlsConfig := &tls.Config{
		ServerName:         s.cfg.Email.Host,
		InsecureSkipVerify: true,
		MinVersion:         tls.VersionTLS12,
	}

	// 创建SMTP客户端
	client, err := mail.NewClient(s.cfg.Email.Host,
		mail.WithPort(s.cfg.Email.Port),
		mail.WithUsername(s.cfg.Email.User),
		mail.WithPassword(s.cfg.Email.Password),
		mail.WithTLSConfig(tlsConfig),
		mail.WithTimeout(30*time.Second),
		mail.WithSSL(), // 使用SSL（端口465）
		mail.WithSMTPAuth(mail.SMTPAuthLogin), // 使用LOGIN认证
		mail.WithTLSPolicy(mail.TLSMandatory),
	)
	if err != nil {
		log.Printf("创建SMTP客户端失败: %v\n", err)
		return fmt.Errorf("创建SMTP客户端失败: %v", err)
	}

	// 设置调试模式
	client.SetDebugLog(true)

	// 发送邮件
	if err := client.DialAndSend(m); err != nil {
		log.Printf("发送邮件失败: %v\n", err)
		// 打印更详细的错误信息
		if smtpErr, ok := err.(*mail.SendError); ok {
			log.Printf("SMTP错误消息: %v\n", smtpErr.Error())
		}
		return fmt.Errorf("发送邮件失败: %v", err)
	}

	log.Printf("邮件发送成功到 %v\n", to)
	return nil
}

// SendVerificationCode 发送验证码邮件
func (s *EmailService) SendVerificationCode(to, code, codeType string) error {
	log.Printf("准备发送验证码邮件 - 收件人: %s, 类型: %s\n", to, codeType)
	
	var subject, template string

	switch codeType {
	case "register":
		subject = "注册验证码"
		template = `
		<div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
			<h2 style="color: #333;">欢迎注册</h2>
			<p>您的注册验证码是：<strong style="color: #007bff; font-size: 20px;">%s</strong></p>
			<p>验证码有效期为5分钟，请尽快完成注册。</p>
			<p style="color: #666; font-size: 14px;">如果这不是您的操作，请忽略此邮件。</p>
		</div>`
	case "reset_password":
		subject = "重置密码验证码"
		template = `
		<div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
			<h2 style="color: #333;">重置密码</h2>
			<p>您的重置密码验证码是：<strong style="color: #007bff; font-size: 20px;">%s</strong></p>
			<p>验证码有效期为5分钟，请尽快完成密码重置。</p>
			<p style="color: #666; font-size: 14px;">如果这不是您的操作，请立即检查账号安全。</p>
		</div>`
	case "change_email":
		subject = "更换邮箱验证码"
		template = `
		<div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
			<h2 style="color: #333;">更换邮箱</h2>
			<p>您的更换邮箱验证码是：<strong style="color: #007bff; font-size: 20px;">%s</strong></p>
			<p>验证码有效期为5分钟，请尽快完成邮箱更换。</p>
			<p style="color: #666; font-size: 14px;">如果这不是您的操作，请立即检查账号安全。</p>
		</div>`
	default:
		log.Printf("不支持的验证码类型: %s\n", codeType)
		return fmt.Errorf("unsupported code type: %s", codeType)
	}

	content := fmt.Sprintf(template, code)
	return s.SendEmail([]string{to}, subject, content)
}
