package utils

import "strconv"

// MustInt 将字符串转换为整数，如果转换失败则panic
func MustInt(s string) int {
	i, err := strconv.Atoi(s)
	if err != nil {
		panic(err)
	}
	return i
}

// MustInt64 将字符串转换为int64，如果转换失败则panic
func MustInt64(s string) int64 {
	i, err := strconv.ParseInt(s, 10, 64)
	if err != nil {
		panic(err)
	}
	return i
}

// ParseInt 将字符串转换为整数，如果转换失败则返回默认值
func ParseInt(s string, defaultVal int) int {
	i, err := strconv.Atoi(s)
	if err != nil {
		return defaultVal
	}
	return i
}

// ParseInt64 将字符串转换为int64，如果转换失败则返回默认值
func ParseInt64(s string, defaultVal int64) int64 {
	i, err := strconv.ParseInt(s, 10, 64)
	if err != nil {
		return defaultVal
	}
	return i
}
