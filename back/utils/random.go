package utils

import (
	"crypto/rand"
	"encoding/base64"
	"math/big"
)

const (
	// 用于生成随机密码的字符集
	letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	numbers = "0123456789"
	symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?"
)

// GenerateRandomString 生成指定长度的随机字符串
func GenerateRandomString(length int) string {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return base64.URLEncoding.EncodeToString([]byte(GenerateRandomPassword()))[:length]
	}
	for i := 0; i < length; i++ {
		bytes[i] = letters[bytes[i]%byte(len(letters))]
	}
	return string(bytes)
}

// GenerateRandomPassword 生成随机密码
// 密码包含大小写字母、数字和特殊字符
func GenerateRandomPassword() string {
	length := 12 // 密码长度
	chars := letters + numbers + symbols
	password := make([]byte, length)

	// 确保至少包含一个大写字母、一个小写字母、一个数字和一个特殊字符
	password[0] = letters[randInt(26)]                     // 小写字母
	password[1] = letters[randInt(26)+26]                 // 大写字母
	password[2] = numbers[randInt(10)]                    // 数字
	password[3] = symbols[randInt(len(symbols))]          // 特殊字符

	// 填充剩余字符
	for i := 4; i < length; i++ {
		password[i] = chars[randInt(len(chars))]
	}

	// 打乱密码字符顺序
	for i := length - 1; i > 0; i-- {
		j := randInt(i + 1)
		password[i], password[j] = password[j], password[i]
	}

	return string(password)
}

// randInt 生成 [0,max) 范围内的随机整数
func randInt(max int) int {
	result, err := rand.Int(rand.Reader, big.NewInt(int64(max)))
	if err != nil {
		panic(err) // 在实际应用中应该更优雅地处理错误
	}
	return int(result.Int64())
}
