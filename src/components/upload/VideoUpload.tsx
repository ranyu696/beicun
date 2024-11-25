'use client'

import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Video, X, Loader2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface VideoUploadProps {
  value: string
  onChange: (value: string) => void
  onRemove: () => void
  className?: string
  uploadType?: string
}

export function VideoUpload({
  value,
  onChange,
  onRemove,
  className,
  uploadType = 'product-video'
}: VideoUploadProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setLoading(true)
      const file = acceptedFiles[0]
      
      // 检查文件大小
      const MAX_SIZE = 100 * 1024 * 1024 // 100MB
      if (file.size > MAX_SIZE) {
        throw new Error('视频大小不能超过 100MB')
      }

      // 检查文件类型
      if (!file.type.startsWith('video/')) {
        throw new Error('请上传视频文件')
      }
      
      // 创建 FormData
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', uploadType)

      // 发送上传请求到统一的上传路由
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '上传失败')
      }

      const data = await response.json()
      onChange(data.url)
      
      toast({
        title: "上传成功",
        description: "视频已上传"
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        variant: "destructive",
        title: "上传失败",
        description: error instanceof Error ? error.message : "请稍后重试"
      })
    } finally {
      setLoading(false)
    }
  }, [onChange, toast, uploadType])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm']
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
    disabled: loading
  })

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-4 hover:border-primary/50 transition-colors',
          isDragActive && 'border-primary',
          loading && 'opacity-50 cursor-not-allowed',
          'cursor-pointer'
        )}
      >
        <input {...getInputProps()} />
        
        {value ? (
          <div className="relative">
            <video 
              src={value}
              controls
              className="w-full rounded-lg"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 p-4">
            {loading ? (
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
            ) : (
              <Video className="h-8 w-8 text-muted-foreground" />
            )}
            <div className="text-sm text-muted-foreground text-center">
              {loading ? (
                <span>正在上传...</span>
              ) : isDragActive ? (
                <span>放开以上传视频</span>
              ) : (
                <span>
                  拖放视频至此处，或
                  <span className="text-primary mx-1">点击上传</span>
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              支持 MP4、WebM 格式，最大 100MB
            </div>
          </div>
        )}
      </div>
    </div>
  )
}