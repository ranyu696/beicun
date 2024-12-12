'use client'

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useRouter } from 'next/navigation'
import { pinyin } from 'pinyin-pro'
import { Wand2 } from 'lucide-react'
import {  ImagePlus, X, GripVertical } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { cn } from '@/lib/utils'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'


// 表单验证Schema
const productSchema = z.object({
  // 基本信息
  name: z.string().min(1, '请输入产品名称'),
  slug: z.string().min(1, '请输入URL标识'),
  price: z.number().min(0, '价格不能小于0'),
  brandId: z.string().min(1, '请选择品牌'),
  productTypeId: z.string().min(1, '请选择产品类型'),
  channelTypeId: z.string().min(1, '请选择通道类型'),
  materialTypeId: z.string().min(1, '请选择材料类型'),
  description: z.string().optional(),
  taobaoUrl: z.string().optional(),
  
  // 规格参数
  registrationDate: z.date(),
  height: z.number().min(0),
  width: z.number().min(0),
  length: z.number().min(0),
  channelLength: z.number().min(0),
  totalLength: z.number().min(0),
  weight: z.number().min(0),
  version: z.string(),
  isReversible: z.boolean(),
  
  // 产品特性
  stimulation: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  softness: z.enum(['ULTRA_SOFT', 'SOFT', 'MEDIUM', 'HARD', 'ULTRA_HARD']),
  tightness: z.enum(['TIGHT', 'MEDIUM', 'LOOSE']),
  smell: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  oiliness: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  durability: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  
  // 媒体资源
  mainImage: z.string().optional(),
  salesImage: z.string().optional(),
  videoUrl: z.string().optional(),
  detailImages: z.array(z.string()),
  productImages: z.array(z.object({
    url: z.string(),
    order: z.number()
  })).default([]),
  
  // 标签
  tags: z.array(z.string()).default([]),
  utilityTypeId: z.string().min(1, '请选择器具类型'),
})

type ProductFormValues = z.infer<typeof productSchema>

// 分离数据库模型接口
interface ProductModel {
  id: string
  name: string
  slug: string
  price: number
  brandId: string
  productTypeId: string
  channelTypeId: string
  materialTypeId: string
  utilityTypeId: string
  description?: string
  taobaoUrl?: string
  registrationDate: Date
  height: number
  width: number
  length: number
  channelLength: number
  totalLength: number
  weight: number
  version: string
  isReversible: boolean
  stimulation: 'LOW' | 'MEDIUM' | 'HIGH'
  softness: 'ULTRA_SOFT' | 'SOFT' | 'MEDIUM' | 'HARD' | 'ULTRA_HARD'
  tightness: 'TIGHT' | 'MEDIUM' | 'LOOSE'
  smell: 'HIGH' | 'MEDIUM' | 'LOW'
  oiliness: 'HIGH' | 'MEDIUM' | 'LOW'
  durability: 'HIGH' | 'MEDIUM' | 'LOW'
  mainImage: string
  salesImage: string
  videoUrl?: string
  detailImages: string[]
  ProductImage?: {
    id: string
    imageUrl: string
    sortOrder: number
  }[]
  tags?: {
    id: string
    tagId: string
  }[]
}

interface FormData {
  brands: {
    id: string
    name: string
  }[]
  productTypes: {
    id: string
    name: string
  }[]
  channelTypes: {
    id: string
    name: string
  }[]
  materialTypes: {
    id: string
    name: string
  }[]
  tags: {
    id: string
    name: string
  }[]
}

interface ProductFormProps {
  initialData?: ProductModel
  formData: FormData
}

// 文件上传相关类型
interface ProductImage {
  id: string
  url: string
  order: number
  description: string
}

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




export function ProductForm({ initialData, formData }: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      price: initialData?.price || 0,
      brandId: initialData?.brandId || '',
      productTypeId: initialData?.productTypeId || '',
      utilityTypeId: initialData?.utilityTypeId || '',
      channelTypeId: initialData?.channelTypeId || '',
      materialTypeId: initialData?.materialTypeId || '',
      description: initialData?.description || '',
      taobaoUrl: initialData?.taobaoUrl || '',
      registrationDate: initialData?.registrationDate || new Date(),
      height: initialData?.height || 0,
      width: initialData?.width || 0,
      length: initialData?.length || 0,
      channelLength: initialData?.channelLength || 0,
      totalLength: initialData?.totalLength || 0,
      weight: initialData?.weight || 0,
      version: initialData?.version || '',
      isReversible: initialData?.isReversible || false,
      stimulation: initialData?.stimulation || 'MEDIUM',
      softness: initialData?.softness || 'MEDIUM',
      tightness: initialData?.tightness || 'MEDIUM',
      smell: initialData?.smell || 'MEDIUM',
      oiliness: initialData?.oiliness || 'MEDIUM',
      durability: initialData?.durability || 'MEDIUM',
      mainImage: initialData?.mainImage || '',
      salesImage: initialData?.salesImage || '',
      videoUrl: initialData?.videoUrl || '',
      detailImages: initialData?.detailImages || [],
      productImages: initialData?.ProductImage?.map(img => ({
        id: img.id,
        url: img.imageUrl,
        order: img.sortOrder
      })) || [],
      tags: initialData?.tags?.map(tag => tag.tagId) || []
    }
  })

  // 文件上传状态
  const [filesToUpload, setFilesToUpload] = useState<FilesToUpload>({
    detailImages: [],
    productImages: []
  })

  // 处理表单提交
  async function onSubmit(data: ProductFormValues) {
    try {
      setLoading(true)

      // 添加文件验证
      if (!initialData?.mainImage && !filesToUpload.mainImage) {
        toast({
          variant: "destructive",
          title: "验证失败",
          description: "请上传产品主图"
        })
        return
      }

      if (!initialData?.salesImage && !filesToUpload.salesImage) {
        toast({
          variant: "destructive",
          title: "验证失败",
          description: "请上传销售图"
        })
        return
      }

      // 1. 创建/更新产品基本信息
      const productResponse = await fetch(
        initialData ? `/api/products/${initialData.id}` : '/api/products',
        {
          method: initialData ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            // 如果要上传新文件，先清空对应的字段
            mainImage: filesToUpload.mainImage ? '' : data.mainImage,
            salesImage: filesToUpload.salesImage ? '' : data.salesImage,
            videoUrl: filesToUpload.video ? '' : data.videoUrl,
            detailImages: filesToUpload.detailImages.length > 0 ? [] : data.detailImages,
            productImages: filesToUpload.productImages.length > 0 ? [] : data.productImages,
          })
        }
      )

      if (!productResponse.ok) {
        const errorData = await productResponse.json()
        throw new Error(errorData.error || '保存产品信息失败')
      }

      const { data: product } = await productResponse.json()
      const productId = product.id

      // 2. 上传文件
      const uploadPromises: Promise<void>[] = []
      const updates: Partial<ProductFormValues> = {}

      // 上传主图
      if (filesToUpload.mainImage) {
        uploadPromises.push(
          uploadFile(filesToUpload.mainImage.file, 'main', productId)
            .then(url => { updates.mainImage = url })
        )
      }

      // 上传销售图
      if (filesToUpload.salesImage) {
        uploadPromises.push(
          uploadFile(filesToUpload.salesImage.file, 'sales', productId)
            .then(url => { updates.salesImage = url })
        )
      }

      // 上传视频
      if (filesToUpload.video) {
        uploadPromises.push(
          uploadFile(filesToUpload.video.file, 'video', productId)
            .then(url => { updates.videoUrl = url })
        )
      }

      // 上传详情图片
      if (filesToUpload.detailImages.length > 0) {
        const detailPromises = filesToUpload.detailImages.map(file =>
          uploadFile(file.file, 'details', productId)
        )
        uploadPromises.push(
          Promise.all(detailPromises)
            .then(urls => { updates.detailImages = urls })
        )
      }

      // 上传产品图文
      if (filesToUpload.productImages.length > 0) {
        const productImagePromises = filesToUpload.productImages.map(async (file, index) => {
          try {
            const url = await uploadFile(file.file, 'product-image', productId)
            return {
              url,
              order: index,
              description: file.description || ''
            }
          } catch (error) {
            console.error('产品图片上传失败:', error)
            throw new Error('产品图片上传失败')
          }
        })

        try {
          const productImages = await Promise.all(productImagePromises)
          updates.productImages = productImages
        } catch (error) {
          console.error('处理产品图文失败:', error)
          throw error
        }
      }

      // 3. 等待所有文件上传完成
      await Promise.all(uploadPromises)

      // 4. 如果有文件上传，更新产品信息
      if (Object.keys(updates).length > 0) {
        console.log('准备更新的媒体信息:', updates) // 添加日志
        try {
          const updateResponse = await fetch(`/api/products/${productId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          })

          if (!updateResponse.ok) {
            const errorData = await updateResponse.json()
            console.error('更新响应错误:', errorData) // 添加错误日志
            if (errorData.details) {
              // 如果有详细的验证错误信息
              const errorMessage = errorData.details
                .map((err: { path: string; message: string }) => 
                  `${err.path}: ${err.message}`
                )
                .join('; ')
              throw new Error(`数据验证失败: ${errorMessage}`)
            }
            throw new Error(errorData.error || '更新产品媒体信息失败')
          }

          const updateResult = await updateResponse.json()
          if (!updateResult.success) {
            throw new Error(updateResult.error || '更新产品媒体信息失败')
          }
        } catch (error) {
          console.error('更新请求失败:', error)
          throw error
        }
      }

      cleanupPreviews()
      toast({ title: '保存成功' })
      router.push('/admin/products')
    } catch (error) {
      console.error('保存失败:', error)
      toast({
        variant: 'destructive',
        title: '保存失败',
        description: error instanceof Error ? error.message : '请稍后重试'
      })
    } finally {
      setLoading(false)
    }
  }

  // 添加生成 slug 的函数
  const generateSlug = (name: string) => {
    // 转换为拼音，不带声调
    const pinyinStr = pinyin(name, {
      toneType: 'none',
      type: 'string',
      nonZh: 'consecutive' // 保留非中文字符
    })

    // 转小写并规范化
    return pinyinStr
      .toLowerCase()
      .replace(/\s+/g, '-') // 将空格替换为连字符
      .replace(/[^a-z0-9-]/g, '') // 只保留字母、数字和连字符
      .replace(/-+/g, '-') // 将多个连字符替换为单个
      .replace(/^-+|-+$/g, '') // 移除首尾连字符
  }

  // 处理单个文件选择
  const handleSingleFileSelect = (
    file: File, 
    type: string,
    maxSize: number = 5 // 默认5MB
  ) => {
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "文件过大",
        description: `文件大小不能超过 ${maxSize}MB`
      })
      return null
    }

    // 验证文件类型
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    
    if (type.includes('video') && !isVideo) {
      toast({
        variant: "destructive",
        title: "文件类型错误",
        description: "请上传视频文件"
      })
      return null
    }

    if (!type.includes('video') && !isImage) {
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

  // 清理预览URL
  const cleanupPreviews = () => {
    if (filesToUpload.mainImage?.preview) {
      URL.revokeObjectURL(filesToUpload.mainImage.preview)
    }
    if (filesToUpload.salesImage?.preview) {
      URL.revokeObjectURL(filesToUpload.salesImage.preview)
    }
    if (filesToUpload.video?.preview) {
      URL.revokeObjectURL(filesToUpload.video.preview)
    }
    filesToUpload.detailImages.forEach(file => {
      URL.revokeObjectURL(file.preview)
    })
  }

  // 处理详情图片排序
  const handleDetailImageReorder = useCallback((result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(filesToUpload.detailImages)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setFilesToUpload(prev => ({
      ...prev,
      detailImages: items
    }))
  }, [filesToUpload.detailImages])

  // 处理详情图片拖放上传
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024,
    onDrop: useCallback((acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map(file => ({
        file,
        type: 'details',
        preview: URL.createObjectURL(file)
      }))

      setFilesToUpload(prev => ({
        ...prev,
        detailImages: [...prev.detailImages, ...newFiles]
      }))
    }, [])
  })

  // 上传文件的辅助函数
  const uploadFile = async (file: File, type: string, productId: string): Promise<string> => {
    try {
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
      if (!data.url) {
        throw new Error('上传响应中缺少URL')
      }

      return data.url
    } catch (error) {
      console.error('文件上传错误:', error)
      throw new Error('文件上传失败，请重试')
    }
  }

  // 处理产品图文排序
  const handleProductImageReorder = useCallback((result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(filesToUpload.productImages)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setFilesToUpload(prev => ({
      ...prev,
      productImages: items
    }))
  }, [filesToUpload.productImages])

  // 产品图文的 dropzone
  const {
    getRootProps: getProductImageRootProps,
    getInputProps: getProductImageInputProps,
    isDragActive: isProductImageDragActive
  } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024,
    onDrop: useCallback((acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map(file => ({
        file,
        type: 'product-image',
        preview: URL.createObjectURL(file),
        description: ''
      }))

      setFilesToUpload(prev => ({
        ...prev,
        productImages: [...prev.productImages, ...newFiles]
      }))
    }, [])
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="basic">
          <TabsList>
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="specs">规格参数</TabsTrigger>
            <TabsTrigger value="features">产品特性</TabsTrigger>
            <TabsTrigger value="media">媒体资源</TabsTrigger>
          </TabsList>
          
          {/* 基本信息 */}
          <TabsContent value="basic" className="space-y-6">
            {/* 名称和URL标识 */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>产品名称</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="请输入产品名称" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL标识</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input {...field} placeholder="请输入URL标识" />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const name = form.getValues('name')
                          if (name) {
                            const slug = generateSlug(name)
                            form.setValue('slug', slug)
                          } else {
                            toast({
                              variant: "destructive",
                              title: "生成失败",
                              description: "先输入产品名称"
                            })
                          }
                        }}
                        title="自动生成拼音"
                      >
                        <Wand2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormDescription>
                      用于生成产品页面的URL，只能包含字母、数字和连字符
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 价格 */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>价格</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field}
                      value={field.value || ''}
                      onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : '')}
                      placeholder="请输入价格" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 品牌选择 */}
            <FormField
              control={form.control}
              name="brandId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>品牌</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择品牌" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {formData.brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 产品类型选择 */}
            <FormField
              control={form.control}
              name="productTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>产品类型</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择产品类型" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {formData.productTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 通道类型选择 */}
            <FormField
              control={form.control}
              name="channelTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>通道类型</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择通道类型" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {formData.channelTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 材料类型选择 */}
            <FormField
              control={form.control}
              name="materialTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>材料</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选料类型" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {formData.materialTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 描述 */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>产品描述</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="请输入产品描述"
                      className="h-32"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 淘宝链接 */}
            <FormField
              control={form.control}
              name="taobaoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>淘宝链接</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="请输入淘宝商品链接" />
                  </FormControl>
                  <FormDescription>
                    用于跳转到淘宝购买页面
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          {/* 规格参数 */}
          <TabsContent value="specs" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="registrationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>注册日期</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={e => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>版本</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 尺寸信息 */}
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>高度 (mm)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : '')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="width"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>宽度 (mm)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : '')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>长度 (mm)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : '')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="channelLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>通道长度 (mm)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : '')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>总长度 (mm)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : '')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>重量 (g)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : '')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isReversible"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>可洗</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
          
          {/* 产品特性 */}
          <TabsContent value="features" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stimulation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>刺激度</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择刺激" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">低刺</SelectItem>
                        <SelectItem value="MEDIUM">一般</SelectItem>
                        <SelectItem value="HIGH">高刺激</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="softness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>软硬度</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择软硬度" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ULTRA_SOFT">超软</SelectItem>
                        <SelectItem value="SOFT">软</SelectItem>
                        <SelectItem value="MEDIUM">一般</SelectItem>
                        <SelectItem value="HARD">硬</SelectItem>
                        <SelectItem value="ULTRA_HARD">超硬</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tightness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>紧致度</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择紧致度" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TIGHT">紧</SelectItem>
                        <SelectItem value="MEDIUM">一般</SelectItem>
                        <SelectItem value="LOOSE">松</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="smell"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>气味度</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择气味度" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HIGH">大</SelectItem>
                        <SelectItem value="MEDIUM">一般</SelectItem>
                        <SelectItem value="LOW">小</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="oiliness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>出油量</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择出油量" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HIGH">大</SelectItem>
                        <SelectItem value="MEDIUM">一般</SelectItem>
                        <SelectItem value="LOW">小</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="durability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>耐用度</FormLabel>
                      <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择耐用度" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HIGH">高</SelectItem>
                        <SelectItem value="MEDIUM">一般</SelectItem>
                        <SelectItem value="LOW">低</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>
          </TabsContent>
          
          {/* 媒体资源 */}
          <TabsContent value="media" className="space-y-6">
            {/* 产品主图 */}
            <FormField
              control={form.control}
              name="mainImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>产品主图</FormLabel>
                  <FormDescription>
                    用于产品列表和详情页展示的主要图片
                  </FormDescription>
                  <FormControl>
                    <div className="space-y-4">
                      {(filesToUpload.mainImage?.preview || field.value) && (
                        <div className="relative aspect-square w-[200px]">
                          <Image
                            src={filesToUpload.mainImage?.preview || field.value || ''}
                            alt="主图"
                            fill
                            className="object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              if (filesToUpload.mainImage?.preview) {
                                URL.revokeObjectURL(filesToUpload.mainImage.preview)
                              }
                              setFilesToUpload(prev => ({ ...prev, mainImage: null }))
                              field.onChange('')
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 销售图 */}
            <FormField
              control={form.control}
              name="salesImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>销售图</FormLabel>
                  <FormDescription>
                    用于商品推广的营销图片
                  </FormDescription>
                  <FormControl>
                    <div className="space-y-4">
                      {(filesToUpload.salesImage?.preview || field.value) && (
                        <div className="relative aspect-square w-[200px]">
                          <Image
                            src={filesToUpload.salesImage?.preview || field.value || ''}
                            alt="销售图"
                            fill
                            className="object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              if (filesToUpload.salesImage?.preview) {
                                URL.revokeObjectURL(filesToUpload.salesImage.preview)
                              }
                              setFilesToUpload(prev => ({ ...prev, salesImage: null }))
                              field.onChange('')
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 视频 */}
            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>产品视频</FormLabel>
                  <FormDescription>
                    产品使用演示或介绍视频
                  </FormDescription>
                  <FormControl>
                    <div className="space-y-4">
                      {(filesToUpload.video?.preview || field.value) ? (
                        <div className="relative w-[300px]">
                          <video 
                            src={filesToUpload.video?.preview || field.value}
                            controls
                            className="w-full rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              if (filesToUpload.video?.preview) {
                                URL.revokeObjectURL(filesToUpload.video.preview)
                              }
                              setFilesToUpload(prev => ({ ...prev, video: null }))
                              field.onChange('')
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div 
                          className="flex flex-col items-center justify-center gap-4 p-6 border-2 border-dashed rounded-lg hover:border-primary/50 transition cursor-pointer"
                          onClick={() => document.getElementById('video-upload')?.click()}
                        >
                          <ImagePlus className="h-10 w-10 text-muted-foreground" />
                          <div className="text-sm text-muted-foreground text-center">
                            <span>点击或拖放视频至此处</span>
                            <p className="text-xs">支持 MP4、WebM 格式，最大 100MB</p>
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
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    支持 MP4、WebM 格式视频，最大 100MB
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 官方详情图片 */}
            <FormField
              control={form.control}
              name="detailImages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>官方详情图片</FormLabel>
                  <FormDescription>
                    产品详情页展示官方图片，支持多张图��上传和排序
                  </FormDescription>
                  <FormControl>
                    <div className="space-y-4">
                      {/* 已上传的图片 */}
                      {field.value?.length > 0 && (
                        <div className="grid grid-cols-4 gap-4">
                          {field.value.map((url, index) => (
                            <div key={url} className="relative aspect-square">
                              <Image
                                src={url}
                                alt={`详情图片 ${index + 1}`}
                                fill
                                className="object-cover rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                  field.onChange(field.value.filter((_, i) => i !== index))
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 待上传的图片 */}
                      <DragDropContext onDragEnd={handleDetailImageReorder}>
                        <Droppable droppableId="detail-images">
                          {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                              {filesToUpload.detailImages.map((file, index) => (
                                <Draggable key={file.preview} draggableId={file.preview} index={index}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className="flex items-center gap-2 p-2 bg-muted rounded-lg group"
                                    >
                                      <div {...provided.dragHandleProps}>
                                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                                      </div>
                                      <div className="relative h-20 w-20">
                                        <Image
                                          src={file.preview}
                                          alt={`预览图片 ${index + 1}`}
                                          fill
                                          className="object-cover rounded-md"
                                        />
                                      </div>
                                      <div className="ml-2 flex-1 min-w-0">
                                        <p className="text-sm truncate">{file.file.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          待上传 - {(file.file.size / 1024 / 1024).toFixed(2)}MB
                                        </p>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => {
                                          URL.revokeObjectURL(file.preview)
                                          setFilesToUpload(prev => ({
                                            ...prev,
                                            detailImages: prev.detailImages.filter((_, i) => i !== index)
                                          }))
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
                      </DragDropContext>

                      {/* 上传区域 */}
                      <div
                        {...getRootProps()}
                        className={cn(
                          "border-2 border-dashed rounded-lg p-6 hover:border-primary/50 transition-colors",
                          "flex flex-col items-center justify-center gap-2",
                          isDragActive && "border-primary/50 bg-primary/5"
                        )}
                      >
                        <input {...getInputProps()} />
                        <ImagePlus className="h-10 w-10 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground text-center">
                          {isDragActive
                            ? "放开以上传图片"
                            : "点击或拖拽图片至此处添加"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          支持 PNG、JPG、WEBP、GIF 格式，单个文件最大 5MB
                        </p>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 产品详情图文 */}
            <FormField
              control={form.control}
              name="productImages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>产品详情图文</FormLabel>
                  <FormDescription>
                    产品详情页的图文介绍内容，支持添加描述文字
                  </FormDescription>
                  <FormControl>
                    <div className="space-y-4">
                      {/* 已有的图文内容 */}
                      {field.value?.length > 0 && (
                        <div className="space-y-4">
                          {(field.value as ProductImage[]).map((item, index) => (
                            <div key={item.id} className="flex gap-4 items-start p-4 border rounded-lg">
                              <div className="relative w-[200px] aspect-square">
                                <Image
                                  src={item.url}
                                  alt={`产品图文 ${index + 1}`}
                                  fill={true}
                                  className="object-cover rounded-lg"
                                />
                              </div>
                              <div className="flex-1">
                                <Input
                                  placeholder="添加图片描述"
                                  value={item.description}
                                  onChange={(e) => {
                                    const newValue = [...field.value] as ProductImage[]
                                    newValue[index] = {
                                      ...newValue[index],
                                      description: e.target.value
                                    }
                                    field.onChange(newValue)
                                  }}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => {
                                  const newValue = field.value.filter(
                                    (_, i: number) => i !== index
                                  ) as ProductImage[]
                                  field.onChange(newValue)
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 待上传的图文内容 */}
                      <DragDropContext onDragEnd={handleProductImageReorder}>
                        <Droppable droppableId="product-images">
                          {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
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
                                      className="flex items-start gap-4 p-4 bg-muted rounded-lg group"
                                    >
                                      <div {...provided.dragHandleProps}>
                                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                                      </div>
                                      <div className="relative h-[200px] w-[200px]">
                                        <Image
                                          src={file.preview}
                                          alt={`预览图片 ${index + 1}`}
                                          fill
                                          className="object-cover rounded-md"
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
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => {
                                          URL.revokeObjectURL(file.preview)
                                          setFilesToUpload(prev => ({
                                            ...prev,
                                            productImages: prev.productImages.filter((_, i) => i !== index)
                                          }))
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
                      </DragDropContext>

                      {/* 图文上传区域 */}
                      <div
                        {...getProductImageRootProps()}
                        className={cn(
                          "border-2 border-dashed rounded-lg p-6 hover:border-primary/50 transition-colors",
                          "flex flex-col items-center justify-center gap-2",
                          isProductImageDragActive && "border-primary/50 bg-primary/5"
                        )}
                      >
                        <input {...getProductImageInputProps()} />
                        <ImagePlus className="h-10 w-10 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground text-center">
                          {isProductImageDragActive
                            ? "放开以上传图片"
                            : "点击或拖拽图片至此处添加产品图文"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          支持 PNG、JPG、WEBP、GIF 格式，单个文件最大 5MB
                        </p>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            取消
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            保存
          </Button>
        </div>
      </form>
    </Form>
  )
}