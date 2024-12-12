'use client'

import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ImagePlus, X, GripVertical } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult
} from '@hello-pangea/dnd'
import { Input } from '@/components/ui/input'

interface ProductMediaUploaderProps {
  productId: string
  productData?: {
    mainImage: string
    salesImage: string
    videoUrl: string | null
    detailImages: string[] | null
    ProductImage: Array<{
      id: string
      imageUrl: string
      description: string | null
      sortOrder: number
    }>
  }
}

// 文件类型定义
interface FileToUpload {
  file: File
  type: string
  preview: string
  description?: string
}

interface FilesToUpload {
  mainImage?: FileToUpload | null
  salesImage?: FileToUpload | null
  video?: FileToUpload | null
  detailImages: FileToUpload[]
  productImages: FileToUpload[]
}

interface LoadingState {
  main: boolean
  sales: boolean
  video: boolean
  product: boolean
  detail: boolean
}

interface ExistingImages {
  detailImages: string[]
  productImages: Array<{
    id: string
    imageUrl: string 
    description: string | null
    sortOrder: number
  }>
}

export function ProductMediaUploader({
  productId,
  productData
}: ProductMediaUploaderProps) {
    {console.log(productData)}
  const [loadingState, setLoadingState] = useState<LoadingState>({
    main: false,
    sales: false,
    video: false,
    product: false,
    detail: false
  })
  const { toast } = useToast()
  const router = useRouter()
  const [filesToUpload, setFilesToUpload] = useState<FilesToUpload>({
    detailImages: [],
    productImages: []
  })
  
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  // 添加已有图片状态
  const [existingImages, setExistingImages] = useState<ExistingImages>({
    detailImages: productData?.detailImages || [],
    productImages: productData?.ProductImage || []
  })

  // 处理文件选择
  const handleSingleFileSelect = (file: File, type: string, maxSize: number = 5) => {
    if (file.size > maxSize * 10024 * 10024) {
      toast({
        variant: "destructive",
        title: "文件过大",
        description: `文件大小不能超过 ${maxSize}MB`
      })
      return null
    }

    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    
    if (type === 'video' && !isVideo) {
      toast({
        variant: "destructive",
        title: "文件类型错误",
        description: "请上传视频文件"
      })
      return null
    }

    if (type !== 'video' && !isImage) {
      toast({
        variant: "destructive",
        title: "文件类型错误",
        description: "请上传图片文件"
      })
      return null
    }

    return {
      file,
      type,
      preview: URL.createObjectURL(file)
    }
  }

  // 处理文件移除
  const handleRemoveFile = (preview: string | undefined, type: string) => {
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setFilesToUpload(prev => ({
      ...prev,
      [type]: null
    }))
  }

  // 处理图片预览
  const handlePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl)
  }

  // 处理拖拽排序
  const handleDragEnd = (result: DropResult, type: 'detailImages' | 'productImages') => {
    if (!result.destination) return

    const items = Array.from(filesToUpload[type])
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setFilesToUpload(prev => ({
      ...prev,
      [type]: items
    }))
  }

  // 处理单个文件上传
  const handleSingleFileUpload = async (file: File, type: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    formData.append('productId', productId)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('文件上传失败')
    }

    const data = await response.json()
    return data.url
  }

  // 处理视频上传
  const handleVideoUpload = async (file: File) => {
    try {
      const chunks: Blob[] = []
      const chunkSize = 5 * 1024 * 1024 // 5MB 每片
      const totalChunks = Math.ceil(file.size / chunkSize)
      
      // 分片
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize
        const end = Math.min(start + chunkSize, file.size)
        chunks.push(file.slice(start, end))
      }

      // 创建上传任务
      const formData = new FormData()
      formData.append('fileName', file.name)
      formData.append('productId', productId)

      const initResponse = await fetch('/api/upload/video/init', {
        method: 'POST',
        body: formData
      })

      if (!initResponse.ok) throw new Error('创建上传任务失败')
      const { uploadId, key } = await initResponse.json()

      // 上传分片
      for (let i = 0; i < chunks.length; i++) {
        const chunkFormData = new FormData()
        chunkFormData.append('chunk', chunks[i])
        chunkFormData.append('key', key)
        chunkFormData.append('chunkNumber', i.toString())
        chunkFormData.append('uploadId', uploadId)

        const chunkResponse = await fetch('/api/upload/video/chunk', {
          method: 'POST',
          body: chunkFormData
        })

        if (!chunkResponse.ok) throw new Error(`分片 ${i + 1} 上传失败`)

        // 更新上传进度
        const progress = Math.round(((i + 1) / totalChunks) * 100)
        setUploadProgress(progress)
      }

      // 完成上传
      const completeResponse = await fetch('/api/upload/video/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, uploadId })
      })

      if (!completeResponse.ok) throw new Error('完成上传失败')
      const { url } = await completeResponse.json()
      return url

    } catch (error) {
      console.error('视频上传失败:', error)
      setUploadProgress(0)
      throw error
    }
  }

  // 处理主图上传和保存
  const handleMainImageSave = async () => {
    if (!filesToUpload.mainImage?.file) return

    try {
      setLoadingState(prev => ({ ...prev, main: true }))
      const url = await handleSingleFileUpload(filesToUpload.mainImage.file, 'main')
      
      const response = await fetch(`/api/products/${productId}/media`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mainImage: url })
      })

      if (!response.ok) throw new Error('更新失败')

      toast({ 
        title: '保存成功',
        description: '主图已更新'
      })
      
      handleRemoveFile(filesToUpload.mainImage.preview, 'mainImage')
      router.refresh()

    } catch (error) {
      toast({
        variant: 'destructive',
        title: '上传失败',
        description: error instanceof Error ? error.message : '请稍后重试'
      })
    } finally {
      setLoadingState(prev => ({ ...prev, main: false }))
    }
  }

  // 处理销售图上传和保存
  const handleSalesImageSave = async () => {
    if (!filesToUpload.salesImage?.file) return

    try {
      setLoadingState(prev => ({ ...prev, sales: true }))
      const url = await handleSingleFileUpload(filesToUpload.salesImage.file, 'sales')
      
      const response = await fetch(`/api/products/${productId}/media`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salesImage: url })
      })

      if (!response.ok) throw new Error('更新失败')

      toast({ 
        title: '保存成功',
        description: '销售图已更新'
      })
      
      handleRemoveFile(filesToUpload.salesImage.preview, 'salesImage')
      router.refresh()

    } catch (error) {
      toast({
        variant: 'destructive',
        title: '上传失败',
        description: error instanceof Error ? error.message : '请稍后重试'
      })
    } finally {
      setLoadingState(prev => ({ ...prev, sales: false }))
    }
  }

  // 处理视频上传和保存
  const handleVideoSave = async () => {
    if (!filesToUpload.video?.file) return

    try {
      setLoadingState(prev => ({ ...prev, video: true }))
      const url = await handleVideoUpload(filesToUpload.video.file)
      
      // 打印上传后的URL，确认是否正确
      console.log('Uploaded video URL:', url)
      
      const response = await fetch(`/api/products/${productId}/media`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: url })
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Video update error:', error)
        throw new Error('更新失败')
      }

      const result = await response.json()
      console.log('Update response:', result)

      toast({ 
        title: '保存成功',
        description: '视频已更新'
      })
      
      handleRemoveFile(filesToUpload.video.preview, 'video')
      router.refresh()

    } catch (error) {
      console.error('视频保存失败:', error)
      toast({
        variant: 'destructive',
        title: '上传失败',
        description: error instanceof Error ? error.message : '请稍后重试'
      })
    } finally {
      setLoadingState(prev => ({ ...prev, video: false }))
      setUploadProgress(0)
    }
  }

  // 处理产品图文上传和保存
  const handleProductImagesSave = async () => {
    if (filesToUpload.productImages.length === 0) return

    try {
      setLoadingState(prev => ({ ...prev, product: true }))
      const productImagePromises = filesToUpload.productImages.map(async (file, index) => ({
        url: await handleSingleFileUpload(file.file, 'product'),
        order: index,
        description: file.description || ''
      }))
      const productImages = await Promise.all(productImagePromises)

      const response = await fetch(`/api/products/${productId}/media`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productImages })
      })

      if (!response.ok) throw new Error('更新失败')

      toast({ 
        title: '保存成功',
        description: '产品图文已更新'
      })
      
      setFilesToUpload(prev => ({ ...prev, productImages: [] }))
      router.refresh()

    } catch (error) {
      toast({
        variant: 'destructive',
        title: '上传失败',
        description: error instanceof Error ? error.message : '请稍后重试'
      })
    } finally {
      setLoadingState(prev => ({ ...prev, product: false }))
    }
  }

  // 处理详情图片上传和保存
  const handleDetailImagesSave = async () => {
    if (filesToUpload.detailImages.length === 0) return

    try {
      setLoadingState(prev => ({ ...prev, detail: true }))
      const newImageUrls = await Promise.all(
        filesToUpload.detailImages.map(file =>
          handleSingleFileUpload(file.file, 'detail')
        )
      )

      // 合并现有图片和新图片
      const allImages = [...existingImages.detailImages, ...newImageUrls]

      const response = await fetch(`/api/products/${productId}/media`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detailImages: allImages })
      })

      if (!response.ok) throw new Error('更新失败')

      toast({ 
        title: '保存成功',
        description: '详情图片已更新'
      })
      
      setFilesToUpload(prev => ({ ...prev, detailImages: [] }))
      setExistingImages(prev => ({
        ...prev,
        detailImages: allImages
      }))
      router.refresh()

    } catch (error) {
      toast({
        variant: 'destructive',
        title: '上传失败',
        description: error instanceof Error ? error.message : '请稍后重试'
      })
    } finally {
      setLoadingState(prev => ({ ...prev, detail: false }))
    }
  }

  // 处理主图和销售图的移除
  const handleRemoveMainImage = () => {
    // 发送请求设置为 null
    fetch(`/api/products/${productId}/media`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mainImage: null })
    }).then(() => {
      toast({ title: '已移除主图' })
      router.refresh()
    })
  }

  const handleRemoveSalesImage = () => {
    fetch(`/api/products/${productId}/media`, {
      method: 'PATCH', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ salesImage: null })
    }).then(() => {
      toast({ title: '已移除销售图' })
      router.refresh()
    })
  }

  // 处理详情图片排序
  const handleDetailImagesDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(existingImages.detailImages)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setExistingImages(prev => ({
      ...prev,
      detailImages: items
    }))

    // 保存新的排序
    fetch(`/api/products/${productId}/media`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ detailImages: items })
    })
  }

  // 处理产品图文排序
  const handleProductImagesDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(existingImages.productImages)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // 更新排序号
    const updatedItems = items.map((item, index) => ({
      ...item,
      sortOrder: index
    }))

    setExistingImages(prev => ({
      ...prev,
      productImages: updatedItems
    }))

    // 保存新的排序
    fetch(`/api/products/${productId}/media`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productImages: updatedItems.map(item => ({
          id: item.id,
          url: item.imageUrl,
          description: item.description,
          order: item.sortOrder
        }))
      })
    })
  }

  return (

      <div className="space-y-6">
{/* 主图上传 */}
<Card>
  <CardContent className="pt-6">
    <div className="space-y-4">
      <div className="font-medium">产品主图</div>
      <div className="text-sm text-muted-foreground">
        用于产品列表和详情页展示的主要图片
      </div>
      <div className="relative aspect-square w-[200px] group">
        <Image
          src={filesToUpload.mainImage?.preview || productData?.mainImage || ''}
          alt="主图"
          fill
          className="object-cover rounded-lg"
        />
        {/* 替换按钮 - 悬浮时显示 */}
        <div 
          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-lg cursor-pointer"
          onClick={() => document.getElementById('main-image-upload')?.click()}
        >
          <Button variant="secondary">
            <ImagePlus className="h-4 w-4 mr-2" />
            替换图片
          </Button>
        </div>
        <input
          id="main-image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              const fileToUpload = handleSingleFileSelect(file, 'main')
              if (fileToUpload) {
                setFilesToUpload(prev => ({
                  ...prev,
                  mainImage: fileToUpload
                }))
              }
            }
          }}
        />
      </div>
    </div>
    {filesToUpload.mainImage && (
      <Button 
        onClick={handleMainImageSave}
        disabled={loadingState.main}
        className="mt-4"
      >
        {loadingState.main && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        保存主图
      </Button>
    )}
  </CardContent>
</Card>

{/* 销售图上传 */}
<Card>
  <CardContent className="pt-6">
    <div className="space-y-4">
      <div className="font-medium">产品销售图</div>
      <div className="text-sm text-muted-foreground">
        用于商品推广的营销图片
      </div>
      <div className="relative aspect-square w-[200px] group">
        <Image
          src={filesToUpload.salesImage?.preview || productData?.salesImage || ''}
          alt="销售图"
          fill
          className="object-cover rounded-lg"
        />
        {/* 替换按钮 - 悬浮时显示 */}
        <div 
          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-lg cursor-pointer"
          onClick={() => document.getElementById('sales-image-upload')?.click()}
        >
          <Button variant="secondary">
            <ImagePlus className="h-4 w-4 mr-2" />
            替换图片
          </Button>
        </div>
        <input
          id="sales-image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              const fileToUpload = handleSingleFileSelect(file, 'sales')
              if (fileToUpload) {
                setFilesToUpload(prev => ({
                  ...prev,
                  salesImage: fileToUpload
                }))
              }
            }
          }}
        />
      </div>
    </div>
    {filesToUpload.salesImage && (
      <Button 
        onClick={handleSalesImageSave}
        disabled={loadingState.sales}
        className="mt-4"
      >
        {loadingState.sales && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        保存销售图
      </Button>
    )}
  </CardContent>
</Card>

{/* 视频上传 */}
<Card>
  <CardContent className="pt-6">
    <div className="space-y-4">
      <div className="font-medium">产品视频</div>
      <div className="text-sm text-muted-foreground">
        产品使用演示或介绍视频
      </div>
      {(filesToUpload.video?.preview || productData?.videoUrl) ? (
        <div className="relative w-[300px] group">
          <video 
            key={filesToUpload.video?.preview || productData?.videoUrl}
            src={filesToUpload.video?.preview || productData?.videoUrl || ''}
            controls
            className="w-full rounded-lg"
            onError={(e) => console.error('Video error:', e)}
          />
          {/* 替换按钮 - 悬浮时显示 */}
          <div 
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-lg cursor-pointer"
            onClick={() => document.getElementById('video-upload')?.click()}
          >
            <Button variant="secondary">
              <ImagePlus className="h-4 w-4 mr-2" />
              替换视频
            </Button>
          </div>
          <input
            id="video-upload"
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                const fileToUpload = handleSingleFileSelect(file, 'video', 100)
                if (fileToUpload) {
                  setFilesToUpload(prev => ({
                    ...prev,
                    video: fileToUpload
                  }))
                }
              }
            }}
          />
        </div>
      ) : (
        <div 
          className="flex flex-col items-center justify-center gap-4 p-6 border-2 border-dashed rounded-lg hover:border-primary/50 transition cursor-pointer"
          onClick={() => document.getElementById('video-upload-empty')?.click()}
        >
          <ImagePlus className="h-10 w-10 text-muted-foreground" />
          <div className="text-sm text-muted-foreground text-center">
            <span>点击或拖放视频至此处</span>
            <p className="text-xs">支持 MP4、WebM 格式，最大 100MB</p>
          </div>
          <input
            id="video-upload-empty"
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                const fileToUpload = handleSingleFileSelect(file, 'video', 100)
                if (fileToUpload) {
                  setFilesToUpload(prev => ({
                    ...prev,
                    video: fileToUpload
                  }))
                }
              }
            }}
          />
        </div>
      )}
    </div>
    {filesToUpload.video && (
      <Button 
        onClick={handleVideoSave}
        disabled={loadingState.video}
        className="mt-4"
      >
        {loadingState.video && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        保存视频
      </Button>
    )}
  </CardContent>
</Card>
{/* 视频上传进度 */}
{uploadProgress > 0 && uploadProgress < 100 && (
  <div className="w-full bg-secondary rounded-full h-2.5 dark:bg-gray-700">
    <div 
      className="bg-primary h-2.5 rounded-full" 
      style={{ width: `${uploadProgress}%` }}
    />
  </div>
)}

{/* 产品图文上传 */}
<Card>
  <CardContent className="pt-6">
    <div className="space-y-4">
      <div className="font-medium">产品图文</div>
      <div className="text-sm text-muted-foreground">
        产品详情页的图文介绍内容，支持添加描述文字
      </div>
      
      <DragDropContext onDragEnd={(result) => {
        if (!result.destination) return
        
        // ��理已有图片的排序
        if (result.source.droppableId === 'existingProductImages' && 
            result.destination.droppableId === 'existingProductImages') {
          const items = Array.from(existingImages.productImages)
          const [reorderedItem] = items.splice(result.source.index, 1)
          items.splice(result.destination.index, 0, reorderedItem)
          
          // 更新排序号
          const updatedItems = items.map((item, index) => ({
            ...item,
            sortOrder: index
          }))

          setExistingImages(prev => ({
            ...prev,
            productImages: updatedItems
          }))

          // 保存新的排序
          fetch(`/api/products/${productId}/media`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productImages: updatedItems.map(item => ({
                id: item.id,
                url: item.imageUrl,
                description: item.description,
                order: item.sortOrder
              }))
            })
          })
        }
        
        // 处理待上传图片的排序
        if (result.source.droppableId === 'newProductImages' && 
            result.destination.droppableId === 'newProductImages') {
          const items = Array.from(filesToUpload.productImages)
          const [reorderedItem] = items.splice(result.source.index, 1)
          items.splice(result.destination.index, 0, reorderedItem)

          setFilesToUpload(prev => ({
            ...prev,
            productImages: items
          }))
        }
      }}>
        {/* 已有的图文列表 */}
        <Droppable droppableId="existingProductImages">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {existingImages.productImages.map((item, index) => (
                <Draggable
                  key={item.id}
                  draggableId={item.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-start gap-4 p-4 border rounded-lg"
                    >
                      <div {...provided.dragHandleProps}>
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="relative w-[200px] aspect-square">
                        <Image
                          src={item.imageUrl}
                          alt={item.description || '产品图片'}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder="添加图片描述"
                          value={item.description || ''}
                          onChange={(e) => {
                            const updatedItems = existingImages.productImages.map((img, i) => 
                              i === index ? { ...img, description: e.target.value } : img
                            )
                            setExistingImages(prev => ({
                              ...prev,
                              productImages: updatedItems
                            }))
                            
                            // 保存更新的描述
                            fetch(`/api/products/${productId}/media`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                productImages: updatedItems.map(img => ({
                                  id: img.id,
                                  url: img.imageUrl,
                                  description: img.description,
                                  order: img.sortOrder
                                }))
                              })
                            })
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newItems = existingImages.productImages.filter(img => img.id !== item.id)
                          setExistingImages(prev => ({
                            ...prev,
                            productImages: newItems
                          }))
                          // 保存删除操作
                          fetch(`/api/products/${productId}/media`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              productImages: newItems.map(img => ({
                                id: img.id,
                                url: img.imageUrl,
                                description: img.description,
                                order: img.sortOrder
                              }))
                            })
                          })
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* 待上传的图文列表 */}
        <Droppable droppableId="newProductImages">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {filesToUpload.productImages.map((file, index) => (
                <Draggable
                  key={file.preview}
                  draggableId={file.preview}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-start gap-4 p-4 bg-muted rounded-lg"
                    >
                      <div {...provided.dragHandleProps}>
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="relative w-[200px] aspect-square">
                        <Image
                          src={file.preview}
                          alt={`预览图片 ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder="添加图片描述"
                          value={file.description || ''}
                          onChange={(e) => {
                            const newFiles = [...filesToUpload.productImages]
                            newFiles[index] = {
                              ...newFiles[index],
                              description: e.target.value
                            }
                            setFilesToUpload(prev => ({
                              ...prev,
                              productImages: newFiles
                            }))
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFile(file.preview, 'productImages')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* 图文上传区域 */}
      <div 
        className="flex flex-col items-center justify-center gap-4 p-6 border-2 border-dashed rounded-lg hover:border-primary/50 transition cursor-pointer"
        onClick={() => document.getElementById('product-images-upload')?.click()}
      >
        <ImagePlus className="h-10 w-10 text-muted-foreground" />
        <div className="text-sm text-muted-foreground text-center">
          <span>点击或拖放图片至此处添加产品图文</span>
          <p className="text-xs">支持 JPG、PNG、GIF 格式，最大 5MB</p>
        </div>
        <input
          id="product-images-upload"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || [])
            const newFiles = files
              .map(file => handleSingleFileSelect(file, 'product'))
              .filter((file): file is FileToUpload => file !== null)

            if (newFiles.length > 0) {
              setFilesToUpload(prev => ({
                ...prev,
                productImages: [...prev.productImages, ...newFiles]
              }))
            }
          }}
        />
      </div>
    </div>
    {filesToUpload.productImages.length > 0 && (
      <Button 
        onClick={handleProductImagesSave}
        disabled={loadingState.product}
        className="mt-4"
      >
        {loadingState.product && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        保存��增图片
      </Button>
    )}
  </CardContent>
</Card>

{/* 详情图片上传 */}
<Card>
  <CardContent className="pt-6">
    <div className="space-y-4">
      <div className="font-medium">详情图片</div>
      <div className="text-sm text-muted-foreground">
        产品详情页展示的图片，支持拖拽排序
      </div>
      <DragDropContext onDragEnd={(result) => {
        if (!result.destination) return
        
        // 处理已有图片的排序
        if (result.source.droppableId === 'existingDetailImages' && 
            result.destination.droppableId === 'existingDetailImages') {
          const items = Array.from(existingImages.detailImages)
          const [reorderedItem] = items.splice(result.source.index, 1)
          items.splice(result.destination.index, 0, reorderedItem)

          setExistingImages(prev => ({
            ...prev,
            detailImages: items
          }))

          // 保存新的排序
          fetch(`/api/products/${productId}/media`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ detailImages: items })
          })
        }
        
        // 处理待上传图片的排序
        if (result.source.droppableId === 'newDetailImages' && 
            result.destination.droppableId === 'newDetailImages') {
          const items = Array.from(filesToUpload.detailImages)
          const [reorderedItem] = items.splice(result.source.index, 1)
          items.splice(result.destination.index, 0, reorderedItem)

          setFilesToUpload(prev => ({
            ...prev,
            detailImages: items
          }))
        }
      }}>
        {/* 已有的详情图片列表 */}
        <Droppable droppableId="existingDetailImages">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {existingImages.detailImages.map((url, index) => (
                <Draggable
                  key={url}
                  draggableId={url}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center gap-4 p-4 bg-muted rounded-lg"
                    >
                      <div {...provided.dragHandleProps}>
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="relative w-[200px] aspect-square">
                        <Image
                          src={url}
                          alt={`详情图片 ${index + 1}`}
                          fill
                          className="object-cover rounded-lg cursor-pointer"
                          onClick={() => handlePreview(url)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newItems = existingImages.detailImages.filter(item => item !== url)
                          setExistingImages(prev => ({
                            ...prev,
                            detailImages: newItems
                          }))
                          // 保存删除操作
                          fetch(`/api/products/${productId}/media`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ detailImages: newItems })
                          })
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* 待上传的详情图片列表 */}
        <Droppable droppableId="newDetailImages">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {filesToUpload.detailImages.map((file, index) => (
                <Draggable
                  key={file.preview}
                  draggableId={file.preview}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center gap-4 p-4 bg-muted rounded-lg"
                    >
                      <div {...provided.dragHandleProps}>
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="relative w-[200px] aspect-square">
                        <Image
                          src={file.preview}
                          alt={`预览图片 ${index + 1}`}
                          fill
                          className="object-cover rounded-lg cursor-pointer"
                          onClick={() => handlePreview(file.preview)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFile(file.preview, 'detailImages')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* 上传区域 */}
      <div 
        className="flex flex-col items-center justify-center gap-4 p-6 border-2 border-dashed rounded-lg hover:border-primary/50 transition cursor-pointer"
        onClick={() => document.getElementById('detail-images-upload')?.click()}
      >
        <ImagePlus className="h-10 w-10 text-muted-foreground" />
        <div className="text-sm text-muted-foreground text-center">
          <span>点击或拖放图片至此处添加详情图片</span>
          <p className="text-xs">支持 JPG、PNG、GIF 格式，最大 5MB</p>
        </div>
        <input
          id="detail-images-upload"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || [])
            const newFiles = files
              .map(file => handleSingleFileSelect(file, 'detail'))
              .filter((file): file is FileToUpload => file !== null)

            if (newFiles.length > 0) {
              setFilesToUpload(prev => ({
                ...prev,
                detailImages: [...prev.detailImages, ...newFiles]
              }))
            }
          }}
        />
      </div>
    </div>
    {filesToUpload.detailImages.length > 0 && (
      <Button 
        onClick={handleDetailImagesSave}
        disabled={loadingState.detail}
        className="mt-4"
      >
        {loadingState.detail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        保存新增图片
      </Button>
    )}
  </CardContent>
</Card>

        {/* 返回按钮 */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            返回
          </Button>
        </div>
      </div>
  )
} 