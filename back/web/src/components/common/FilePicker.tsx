import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ImageIcon, X } from 'lucide-react'
import FilePickerDialog from './FilePickerDialog'

interface FilePickerProps {
  value?: string
  onChange?: (value: string) => void
  accept?: 'image' | 'video' | 'all'
  className?: string
  placeholder?: string
}

export default function FilePicker({
  value,
  onChange,
  accept = 'all',
  className,
  placeholder = '选择文件',
}: FilePickerProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (url: string) => {
    onChange?.(url)
  }

  return (
    <div className={className}>
      {value ? (
        <div className="relative group aspect-square rounded-lg overflow-hidden border">
          {accept === 'image' ? (
            <img
              src={value}
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
              更换
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
        <Button
          variant="outline"
          className="w-full aspect-square"
          onClick={() => setOpen(true)}
        >
          <div className="flex flex-col items-center gap-2">
            <ImageIcon className="h-8 w-8" />
            <span>{placeholder}</span>
          </div>
        </Button>
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
