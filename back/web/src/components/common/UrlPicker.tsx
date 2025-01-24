import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import FilePickerDialog from './FilePickerDialog'
import { getStorageUrl } from '@/lib/storage'

interface UrlPickerProps {
  value?: string
  onChange: (value: string) => void
  accept?: string
  placeholder?: string
  preview?: boolean
  previewComponent?: React.ReactNode
}

export default function UrlPicker({
  value,
  onChange,
  accept,
  placeholder = '请选择文件',
  preview = true,
  previewComponent
}: UrlPickerProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (url: string) => {
    onChange(url)
    setOpen(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={value || ''}
          onChange={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onChange(e.target.value)
          }}
          placeholder={placeholder}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setOpen(true)
          }}
        >
          选择
        </Button>
      </div>

      {preview && value && (
        <div className="mt-2">
          {previewComponent || (
            accept === 'video' ? (
              <video
                src={getStorageUrl(value)}
                controls
                className="w-full max-w-[300px] rounded-lg border"
              />
            ) : accept === 'image' ? (
              <img
                src={getStorageUrl(value)}
                alt="预览图"
                className="w-full max-w-[300px] rounded-lg border"
              />
            ) : null
          )}
        </div>
      )}

      <FilePickerDialog
        open={open}
        onOpenChange={setOpen}
        onSelect={handleSelect}
        accept="video"
        title="选择文件"
      />
    </div>
  )
}
