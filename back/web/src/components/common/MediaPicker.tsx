import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ImageIcon, X, Upload, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getStorageUrl } from '@/lib/storage'
import { useDropzone } from 'react-dropzone'
import { useToast } from '@/hooks/use-toast'
import storage from '@/services/storage'
import FilePickerDialog from './FilePickerDialog'

interface MediaPickerProps {
  value?: string
  onChange?: (value: string) => void
  accept?: 'image' | 'video' | 'all'
  className?: string
  placeholder?: string
  maxSize?: number // 单位：MB
  folderId?: string
  folderName?: string
}

export default function MediaPicker({
  value,
  onChange,
  accept = 'all',
  className,
  placeholder = '选择或上传文件',
  maxSize = 5,
  folderId,
  folderName,
}: MediaPickerProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const onDrop = async (acceptedFiles: File[]) => {
    if (!folderId) {
      toast({
        variant: 'destructive',
        title: '上传失败',
        description: '未指定上传文件夹',
      })
      return
    }

    try {
      const formData = new FormData()
      formData.append('files', acceptedFiles[0])
      formData.append('folder_id', folderId)

      const response = await storage.file.uploadImages(formData)

      if (response.data.code === 0) {
        const url = response.data.data[0].url
        onChange?.(url)
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
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept === 'image' 
      ? { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }
      : accept === 'video'
      ? { 'video/*': ['.mp4', '.webm', '.ogg'] }
      : undefined,
    maxFiles: 1,
    maxSize: maxSize * 1024 * 1024,
  })

  const handleSelect = (url: string) => {
    onChange?.(url)
  }

  return (
    <div className={className}>
      {value ? (
        <div className="relative group aspect-square rounded-lg overflow-hidden border">
          {accept === 'image' ? (
            <img
              src={getStorageUrl(value)}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <ImageIcon className="h-8 w-8" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setOpen(true)}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              选择
            </Button>
            <Button
              variant="secondary"
              size="sm"
              {...getRootProps()}
            >
              <Upload className="h-4 w-4 mr-2" />
              上传
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onChange?.('')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors relative group',
            isDragActive
              ? 'border-primary bg-primary/10'
              : 'border-muted-foreground/25 hover:border-primary/50'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              {isDragActive ? (
                <p>将文件拖放到此处</p>
              ) : (
                <>
                  <p>{placeholder}</p>
                  <p className="text-xs">
                    支持拖放或点击上传，单个文件不超过{maxSize}MB
                  </p>
                </>
              )}
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(true)
            }}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            选择已有文件
          </Button>
        </div>
      )}

      <FilePickerDialog
        open={open}
        onOpenChange={setOpen}
        onSelect={handleSelect}
        accept={accept}
      />
    </div>
  )
}
