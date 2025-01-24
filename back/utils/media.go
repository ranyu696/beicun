package utils

import (
	"bytes"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"os"
	"os/exec"
	"strconv"
	"strings"
)

// GetMediaInfo 获取媒体文件信息（宽度、高度、时长）
func GetMediaInfo(filePath string) (width, height, duration *int) {
	// 先尝试作为图片处理
	if w, h := getImageDimensions(filePath); w != nil && h != nil {
		return w, h, nil
	}

	// 如果不是图片，尝试作为视频处理
	return getVideoDimensions(filePath)
}

// getImageDimensions 获取图片尺寸
func getImageDimensions(filePath string) (width, height *int) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, nil
	}
	defer file.Close()

	img, _, err := image.DecodeConfig(file)
	if err != nil {
		return nil, nil
	}

	w, h := img.Width, img.Height
	return &w, &h
}

// getVideoDimensions 获取视频尺寸和时长
func getVideoDimensions(filePath string) (width, height, duration *int) {
	// 使用 ffprobe 获取视频信息
	cmd := exec.Command("ffprobe",
		"-v", "error",
		"-select_streams", "v:0",
		"-show_entries", "stream=width,height,duration",
		"-of", "csv=s=x:p=0",
		filePath,
	)

	var out bytes.Buffer
	cmd.Stdout = &out

	if err := cmd.Run(); err != nil {
		return nil, nil, nil
	}

	// 解析输出
	parts := strings.Split(strings.TrimSpace(out.String()), "x")
	if len(parts) != 3 {
		return nil, nil, nil
	}

	w, err := strconv.Atoi(parts[0])
	if err != nil {
		return nil, nil, nil
	}

	h, err := strconv.Atoi(parts[1])
	if err != nil {
		return nil, nil, nil
	}

	// 将浮点数时长转换为整数秒
	durationFloat, err := strconv.ParseFloat(parts[2], 64)
	if err != nil {
		return &w, &h, nil
	}
	d := int(durationFloat)

	return &w, &h, &d
}
