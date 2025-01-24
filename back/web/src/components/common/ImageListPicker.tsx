import { useState } from 'react'
import { Button } from '@/components/ui/button'
import FilePickerDialog from './FilePickerDialog'
import { cn } from '@/lib/utils'
import {  GripVertical, Trash2, Plus } from 'lucide-react'
import { getStorageUrl } from '@/lib/storage'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface ImageItem {
  url: string
  width?: number
  height?: number
  sort: number
  description?: string
}

interface ImageListPickerProps {
  value?: ImageItem[]
  onChange: (value: ImageItem[]) => void
  className?: string
  maxCount?: number
}

// 可排序的图片项组件
function SortableImage({ image, onRemove, onDescriptionChange }: { 
  image: ImageItem
  onRemove: () => void 
  onDescriptionChange: (description: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: image.url,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative aspect-[3/2] rounded-lg overflow-hidden border group"
    >
      <img
        src={getStorageUrl(image.url)}
        alt="预览图"
        className="w-full h-full object-contain bg-muted"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            variant="destructive"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onRemove()
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 cursor-grab"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute bottom-2 left-2 right-2 flex gap-2 items-center">
          <div className="text-xs text-white bg-black/60 px-2 py-1 rounded">
            {image.width} x {image.height}
          </div>
          <Textarea
            value={image.description || ''}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="h-8 text-xs bg-black/60 text-white placeholder:text-gray-400"
            placeholder="添加描述..."
          />
        </div>
      </div>
    </div>
  )
}

interface ImagePickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (url: string, description: string) => void
}

function ImagePickerDialog({ open, onOpenChange, onConfirm }: ImagePickerDialogProps) {
  const [selectedUrl, setSelectedUrl] = useState('')
  const [description, setDescription] = useState('')

  const handleConfirm = () => {
    onConfirm(selectedUrl, description)
    setSelectedUrl('')
    setDescription('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加图片</DialogTitle>
          <DialogDescription>
            选择或上传图片
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>选择图片</Label>
            <FilePickerDialog
              open={!selectedUrl}
              onOpenChange={() => {}}
              onSelect={(url) => setSelectedUrl(url)}
              accept="image"
              title="选择图片"
            />
            {selectedUrl && (
              <div className="mt-2 relative aspect-[3/2] rounded-lg overflow-hidden border">
                <img
                  src={getStorageUrl(selectedUrl)}
                  alt="预览图"
                  className="w-full h-full object-contain bg-muted"
                />
              </div>
            )}
          </div>
          <div>
            <Label>图片描述</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请输入图片描述..."
              className="mt-1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedUrl}>
            确认
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ImageListPicker({
  value = [],
  onChange,
  className,
  maxCount = 10
}: ImageListPickerProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 处理图片选择和描述
  const handleImageAdd = async (url: string, description: string) => {
    // 获取图片尺寸
    const img = new Image()
    img.src = getStorageUrl(url)
    
    await new Promise((resolve) => {
      img.onload = () => {
        const newImage = {
          url,
          width: img.width,
          height: img.height,
          sort: value.length,
          description
        }
        onChange([...value, newImage])
        resolve(null)
      }
      img.onerror = () => {
        resolve(null)
      }
    })
  }

  // 处理图片删除
  const handleRemove = (index: number) => {
    const newImages = value.filter((_, i) => i !== index)
    // 更新排序
    onChange(newImages.map((img, i) => ({ ...img, sort: i })))
  }

  // 处理描述更新
  const handleDescriptionChange = (index: number, description: string) => {
    const newImages = [...value]
    newImages[index] = { ...newImages[index], description }
    onChange(newImages)
  }

  // 处理拖拽结束
  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = value.findIndex((item) => item.url === active.id)
      const newIndex = value.findIndex((item) => item.url === over.id)

      const newImages = [...value]
      const [movedItem] = newImages.splice(oldIndex, 1)
      newImages.splice(newIndex, 0, movedItem)

      // 更新排序
      onChange(newImages.map((img, i) => ({ ...img, sort: i })))
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={value.map(item => item.url)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {value.map((image, index) => (
              <SortableImage
                key={image.url}
                image={image}
                onRemove={() => handleRemove(index)}
                onDescriptionChange={(description) => handleDescriptionChange(index, description)}
              />
            ))}

            {value.length < maxCount && (
              <Button
                variant="outline"
                className="aspect-[3/2] flex flex-col items-center justify-center gap-2"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setDialogOpen(true)
                }}
              >
                <Plus className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">添加图片</span>
              </Button>
            )}
          </div>
        </SortableContext>
      </DndContext>

      <ImagePickerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleImageAdd}
      />
    </div>
  )
}
