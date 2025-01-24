package config

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"gopkg.in/yaml.v3"
)

type Config struct {
	Server    ServerConfig    `yaml:"server"`
	Database  DatabaseConfig  `yaml:"database"`
	Redis     RedisConfig     `yaml:"redis"`
	Email     EmailConfig     `yaml:"email"`
	JWT       JWTConfig       `yaml:"jwt"`
	Turnstile TurnstileConfig `yaml:"turnstile"`
	RateLimit RateLimitConfig `yaml:"rateLimit"`
	Storage   StorageConfig   `yaml:"storage"`
}

type ServerConfig struct {
	Port int    `yaml:"port"`
	Mode string `yaml:"mode"`
}

type EmailConfig struct {
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
	From     string `yaml:"from"`
}

type DatabaseConfig struct {
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
	DBName   string `yaml:"dbname"`
}

type RedisConfig struct {
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	Password string `yaml:"password"`
	DB       int    `yaml:"db"`
}

type JWTConfig struct {
	Secret           string `yaml:"secret"`
	AccessTokenExp  int    `yaml:"access_token_exp"`
	RefreshTokenExp int    `yaml:"refresh_token_exp"`
}

type TurnstileConfig struct {
	SiteKey    string `yaml:"siteKey"`
	SecretKey  string `yaml:"secretKey"`
	VerifyURL  string `yaml:"verifyURL"`
}

type RateLimitConfig struct {
	Period time.Duration `yaml:"period"`
	Limit  int64        `yaml:"limit"`
}

// UnmarshalYAML 自定义反序列化
func (r *RateLimitConfig) UnmarshalYAML(unmarshal func(interface{}) error) error {
	type rawConfig struct {
		Period string `yaml:"period"`
		Limit  int    `yaml:"limit"`
	}
	raw := &rawConfig{}
	if err := unmarshal(raw); err != nil {
		return err
	}

	// 解析 Period 字符串为 Duration
	duration, err := time.ParseDuration(raw.Period)
	if err != nil {
		return fmt.Errorf("invalid period format: %v", err)
	}
	r.Period = duration
	r.Limit = int64(raw.Limit)
	return nil
}

// StorageConfig 存储配置
type StorageConfig struct {
	// 存储根路径
	Path string `yaml:"path"`
	// 上传目录
	UploadDir string `yaml:"uploadDir"`
	// 临时文件目录
	TempDir string `yaml:"tempDir"`
	// 合并文件目录
	MergeDir string `yaml:"mergeDir"`
	// 分片大小 (字节)
	ChunkSize int64 `yaml:"chunkSize"`
	// 最大文件大小 (字节)
	MaxFileSize int64 `yaml:"maxFileSize"`
	// 允许的文件类型
	AllowedTypes []string `yaml:"allowedTypes"`
	// 上传并发数
	Concurrency int `yaml:"concurrency"`
	// 最大视频大小
	MaxVideoSize int64 `yaml:"maxVideoSize"`
	// 访问基础URL
	BaseURL string `yaml:"baseUrl"`
}

// LoadConfig 从文件加载配置
func LoadConfig(configPath string) (*Config, error) {
	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, fmt.Errorf("读取配置文件失败: %w", err)
	}

	var config Config
	if err := yaml.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("解析配置文件失败: %w", err)
	}

	// 确保存储路径存在
	if err := os.MkdirAll(config.Storage.Path, 0755); err != nil {
		return nil, fmt.Errorf("创建存储目录失败: %w", err)
	}

	// 确保临时目录存在
	if err := os.MkdirAll(config.Storage.TempDir, 0755); err != nil {
		return nil, fmt.Errorf("创建临时目录失败: %w", err)
	}

	// 设置默认值
	if config.Storage.ChunkSize == 0 {
		config.Storage.ChunkSize = 5 * 1024 * 1024 // 默认 5MB
	}
	if config.Storage.MaxFileSize == 0 {
		config.Storage.MaxFileSize = 10 * 1024 * 1024 // 默认 10MB
	}
	if config.Storage.MaxVideoSize == 0 {
		config.Storage.MaxVideoSize = 500 * 1024 * 1024 // 默认 500MB
	}

	return &config, nil
}

// GetStoragePath 获取完整的存储路径
func (c *Config) GetStoragePath(subPath string) string {
	return filepath.Join(c.Storage.Path, subPath)
}

// GetStorageURL 获取完整的访问URL
func (c *Config) GetStorageURL(subPath string) string {
	return c.Storage.BaseURL + "/" + subPath
}
