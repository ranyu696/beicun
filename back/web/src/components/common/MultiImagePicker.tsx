import { useState } from 'react'
import { Button } from '@/components/ui/button'
import FilePickerDialog from './FilePickerDialog'
import { cn } from '@/lib/utils'
import {  GripVertical, Plus } from 'lucide-react'
import { getStorageUrl } from '@/lib/storage'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ImageItem {
  url: string
  width?: number
  height?: number
  sort: number
}

interface MultiImagePickerProps {
  value?: ImageItem[]
  onChange: (value: ImageItem[]) => void
  className?: string
  maxCount?: number
  gridCols?: number
}

// 可排序的图片项组件
function SortableImage({ image, onRemove }: { image: ImageItem; onRemove: () => void }) {
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
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
        <div className="absolute bottom-2 left-2 text-xs text-white bg-black/60 px-2 py-1 rounded">
          {image.width} x {image.height}
        </div>
      </div>
    </div>
  )
}

export default function MultiImagePicker({
  value = [],
  onChange,
  className,
  maxCount = 5,
  gridCols = 5
}: MultiImagePickerProps) {
  const [open, setOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 处理图片选择
  const handleSelect = async (url: string) => {
    try {
      // 获取图片尺寸
      const img = new Image()
      img.src = getStorageUrl(url)
      
      await new Promise((resolve) => {
        img.onload = () => {
          const newImage = {
            url,
            width: img.width,
            height: img.height,
            sort: value.length
          }
          // 阻止事件冒泡，防止触发表单提交
          setTimeout(() => {
            onChange([...value, newImage])
          }, 0)
          resolve(null)
        }
        img.onerror = () => {
          resolve(null)
        }
      })
    } catch (error) {
      console.error('Error handling image selection:', error)
    }
  }

  // 处理图片删除
  const handleRemove = (index: number) => {
    const newImages = value.filter((_, i) => i !== index)
    // 更新排序
    onChange(newImages.map((img, i) => ({ ...img, sort: i })))
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
          <div className={cn(
            "grid gap-4",
            gridCols === 5 && "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
            gridCols === 4 && "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
            gridCols === 3 && "grid-cols-2 sm:grid-cols-3",
            gridCols === 2 && "grid-cols-2"
          )}>
            {value.map((image, index) => (
              <SortableImage
                key={image.url}
                image={image}
                onRemove={() => handleRemove(index)}
              />
            ))}

            {value.length < maxCount && (
              <Button
                variant="outline"
                className="aspect-[3/2] flex flex-col items-center justify-center gap-2"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setOpen(true)
                }}
              >
                <Plus className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">添加图片</span>
              </Button>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* 文件选择器 */}
      <FilePickerDialog
        open={open}
        onOpenChange={setOpen}
        onSelect={handleSelect}
        accept="image"
        title="选择图片"
      />
    </div>
  )
}
