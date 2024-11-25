'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ImagePlus, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useToast } from '@/hooks/use-toast'

interface ImageUploadProps {
  value: string[]
  onChange: (value: string[]) => void
  maxImages?: number
}

export function ImageUpload({ 
  value = [], 
  onChange, 
  maxImages = 5 
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true)
      const files = e.target.files
      if (!files) return

      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append('files', file)
      })

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('上传失败')

      const data = await response.json()
      onChange([...value, ...data.urls])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "上传失败",
        description: "请稍后重试" + error
      })
    } finally {
      setLoading(false)
    }
  }

  const onRemove = (index: number) => {
    const newImages = [...value]
    newImages.splice(index, 1)
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {value.map((url, index) => (
          <div key={url} className="relative aspect-square">
            <Image
              src={url}
              alt="Upload"
              className="object-cover rounded-lg"
              fill
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => onRemove(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      
      {value.length < maxImages && (
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          className="w-full"
          onClick={() => document.getElementById('image-upload')?.click()}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4 mr-2" />
          )}
          上传图片
        </Button>
      )}
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onUpload}
        disabled={loading || value.length >= maxImages}
      />
      <p className="text-sm text-muted-foreground">
        最多上传 {maxImages} 张图片，每张图片不超过 5MB
      </p>
    </div>
  )
}