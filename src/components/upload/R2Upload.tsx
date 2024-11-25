'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface R2UploadProps {
  onUpload: () => void
  prefix?: string
  className?: string
}

export function R2Upload({ onUpload, prefix = '', className }: R2UploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleUpload = useCallback(async (files: FileList) => {
    if (isUploading) return

    try {
      setIsUploading(true)
      
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        if (prefix) formData.append('prefix', prefix)

        const response = await fetch('/api/r2', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) throw new Error('上传失败')
      }

      toast({
        title: "上传成功",
        description: "文件已上传"
      })
      
      onUpload()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "上传失败",
        description: error instanceof Error ? error.message : "无法上传文件"
      })
    } finally {
      setIsUploading(false)
    }
  }, [prefix, onUpload, toast, isUploading])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleUpload(e.dataTransfer.files)
  }, [handleUpload])

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative",
        isDragging && "after:absolute after:inset-0 after:border-2 after:border-dashed after:border-primary after:rounded-lg",
        className
      )}
    >
      <input
        type="file"
        multiple
        onChange={(e) => e.target.files && handleUpload(e.target.files)}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Button
          variant="outline"
          disabled={isUploading}
          className="cursor-pointer"
          asChild
        >
          <span>
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "上传中..." : "上传"}
          </span>
        </Button>
      </label>
    </div>
  )
}