import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { ImageIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import storage from '@/services/storage'
import type { FileUploadResult } from '@/types/storage'

export interface FileSelectorProps {
  value?: string[]
  onChange?: (value: string[]) => void
  maxFiles?: number
  maxSize?: number // 单位：MB
  accept?: {
    [key: string]: string[]
  }
  className?: string
  folderId?: string
  folderName?: string
}

export default function FileSelector({
  value = [],
  onChange,
  maxFiles = 1,
  maxSize = 5, // 默认5MB
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  },
  className,
  folderId,
  folderName,
}: FileSelectorProps) {
  const { toast } = useToast()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!folderId) {
        toast({
          variant: 'destructive',
          title: '上传失败',
          description: '请先选择要上传到的文件夹',
        })
        return
      }

      try {
        const formData = new FormData()
        acceptedFiles.forEach((file) => {
          formData.append('files', file)
        })
        formData.append('folder_id', folderId)

        const response = await storage.file.uploadImages(formData)

        if (response.data.code === 0) {
          const newUrls = response.data.data.map((item: FileUploadResult) => item.url)
          onChange?.([...value, ...newUrls])
          toast({
            title: '上传成功',
            description: `成功上传到${folderName || '指定文件夹'}`,
          })
        } else {
          throw new Error(response.data.message)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : '文件上传失败'
        toast({
          variant: 'destructive',
          title: '上传失败',
          description: message,
        })
      }
    },
    [folderId, folderName, onChange, toast, value],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: maxFiles - value.length,
    maxSize: maxSize * 1024 * 1024, // 转换为字节
    disabled: value.length >= maxFiles,
  })

  const removeFile = (index: number) => {
    const newValue = [...value]
    newValue.splice(index, 1)
    onChange?.(newValue)
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/10'
            : 'border-muted-foreground/25 hover:border-primary/50',
          value.length >= maxFiles && 'pointer-events-none opacity-50',
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <ImageIcon className="w-8 h-8 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            {isDragActive ? (
              <p>将文件拖放到此处</p>
            ) : (
              <>
                <p>
                  点击或拖放文件到此处上传
                  {maxFiles > 1 && `（最多${maxFiles}个）`}
                </p>
                <p className="text-xs">
                  支持{Object.values(accept)
                    .flat()
                    .join('、')}格式，单个文件不超过{maxSize}MB
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {value.map((url, index) => (
            <div
              key={url}
              className="group relative aspect-square rounded-lg overflow-hidden border"
            >
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
