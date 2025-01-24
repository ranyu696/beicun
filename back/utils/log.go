package utils

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"time"
)

var (
	errorLogger *log.Logger
	infoLogger  *log.Logger
)

func init() {
	// 创建日志目录
	logDir := "logs"
	if err := os.MkdirAll(logDir, 0755); err != nil {
		log.Fatal("无法创建日志目录:", err)
	}

	// 创建或打开错误日志文件
	errorFile, err := os.OpenFile(
		filepath.Join(logDir, "error.log"),
		os.O_CREATE|os.O_WRONLY|os.O_APPEND,
		0666,
	)
	if err != nil {
		log.Fatal("无法打开错误日志文件:", err)
	}

	// 创建或打开信息日志文件
	infoFile, err := os.OpenFile(
		filepath.Join(logDir, "info.log"),
		os.O_CREATE|os.O_WRONLY|os.O_APPEND,
		0666,
	)
	if err != nil {
		log.Fatal("无法打开信息日志文件:", err)
	}

	// 初始化日志记录器
	errorLogger = log.New(errorFile, "ERROR: ", log.Ldate|log.Ltime)
	infoLogger = log.New(infoFile, "INFO: ", log.Ldate|log.Ltime)
}

// LogError 记录错误日志
func LogError(message string, err error) {
	_, file, line, _ := runtime.Caller(1)
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	logMessage := fmt.Sprintf("[%s] %s:%d - %s: %v", timestamp, filepath.Base(file), line, message, err)
	errorLogger.Println(logMessage)
}

// LogInfo 记录信息日志
func LogInfo(message string) {
	_, file, line, _ := runtime.Caller(1)
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	logMessage := fmt.Sprintf("[%s] %s:%d - %s", timestamp, filepath.Base(file), line, message)
	infoLogger.Println(logMessage)
}
