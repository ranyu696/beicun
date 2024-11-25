'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Loader2, ImagePlus, Plus, X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Image from 'next/image'

const formSchema = z.object({
  title: z.string().min(1, '请输入标题'),
  productId: z.string().min(1, '请选择产品'),
  unboxing: z.string().min(1, '请填写开箱体验'),
  unboxingImages: z.array(z.string()).optional(),
  experience: z.string().min(1, '请填写使用感受'),
  maintenance: z.string().min(1, '请填写清洁与维护建议'),
  pros: z.array(z.string()).min(1, '请至少添加一个优点'),
  cons: z.array(z.string()).min(1, '请至少添加一个缺点'),
  conclusion: z.string().min(1, '请填写总结'),
})

type FormValues = z.infer<typeof formSchema>

// 在文件顶部添加类型定义
interface Review {
    id: string
    title: string
    productId: string
    unboxing: string
    unboxingImages: string[]
    experience: string
    maintenance: string
    pros: string[]
    cons: string[]
    conclusion: string
  }
  
  interface Product {
    id: string
    name: string
  }
  
  interface ReviewFormProps {
    products: Product[]
    initialData?: Review // 使用可选的 Review 类型替代 any
  }
  
  interface ImageFile {
    file: File
    preview: string
  }
  

export function ReviewForm({ products, initialData }: ReviewFormProps) {
  const [loading, setLoading] = useState(false)
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([])
  const { toast } = useToast()
  const router = useRouter()

  const defaultValues: Partial<FormValues> = {
    title: initialData?.title || '',
    productId: initialData?.productId || '',
    unboxing: initialData?.unboxing || '',
    unboxingImages: initialData?.unboxingImages || [],
    experience: initialData?.experience || '',
    maintenance: initialData?.maintenance || '',
    pros: initialData?.pros || [''],
    cons: initialData?.cons || [''],
    conclusion: initialData?.conclusion || '',
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // 处理图片选择
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // 检查文件大小
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    if (files[0].size > MAX_SIZE) {
      toast({
        variant: "destructive",
        title: "文件过大",
        description: "图片大小不能超过 5MB"
      })
      return
    }

    // 创建预览URL
    const preview = URL.createObjectURL(files[0])
    
    setImageFiles(prev => [...prev, {
      file: files[0],
      preview
    }])

    // 清空 input
    e.target.value = ''
  }

  // 处理删除图片
  const handleRemoveImage = (index: number) => {
    setImageFiles(prev => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].preview) // 释放预览URL
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  // 上传单个图片
  const uploadImage = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'review-unboxing')

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('图片上传失败')
    }

    const data = await response.json()
    return data.url
  }

  // 提交表单
  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true)

      // 上传所有图片
      const uploadPromises = imageFiles.map(img => uploadImage(img.file))
      const uploadedUrls = await Promise.all(uploadPromises)

      // 合并现有图片和新上传的图片
      const existingImages = initialData?.unboxingImages || []
      const allImages = [...existingImages, ...uploadedUrls]

      // 更新表单数据
      const finalData = {
        ...data,
        unboxingImages: allImages
      }

      const url = initialData 
        ? `/api/reviews/${initialData.id}`
        : '/api/reviews'
      const method = initialData ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      })

      if (!response.ok) throw new Error('提交失败')

      toast({
        title: initialData ? "更新成功" : "创建成功",
        description: initialData ? "测评已更新" : "测评已创建"
      })

      router.push('/admin/reviews')
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "提交失败",
        description: error instanceof Error ? error.message : "请稍后重试"
      })
    } finally {
      setLoading(false)
    }
  }

  // 清理预览URL
  useEffect(() => {
    return () => {
      imageFiles.forEach(img => URL.revokeObjectURL(img.preview))
    }
  }, [imageFiles])

  // 处理添加优缺点
  const handleAddPoint = (field: 'pros' | 'cons') => {
    const current = form.getValues(field)
    form.setValue(field, [...current, ''])
  }

  // 处理删除优缺点
  const handleRemovePoint = (field: 'pros' | 'cons', index: number) => {
    const current = form.getValues(field)
    if (current.length > 1) {
      form.setValue(field, current.filter((_, i) => i !== index))
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>标题</FormLabel>
              <FormControl>
                <Input {...field} placeholder="请输入测评标题" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>产品</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择产品" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unboxing"
          render={({ field }) => (
            <FormItem>
              <FormLabel>开箱体验</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="描述产品的开体验..."
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unboxingImages"
          render={({ field: { onChange, value } }) => (
            <FormItem>
              <FormLabel>开箱图片</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {/* 显示已有的图片 */}
                    {value?.map((url, index) => (
                      <div key={url} className="relative aspect-square">
                        <Image
                          src={url}
                          alt={`开箱图片 ${index + 1}`}
                          width={400}
                          height={400}
                          className="object-cover rounded-lg absolute inset-0 w-full h-full"
                          priority={index < 4} // 优先加载前4张图片
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 z-10"
                          onClick={() => {
                            const newImages = value.filter((_, i) => i !== index)
                            onChange(newImages)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    {/* 显示新选择的图片预览 */}
                    {imageFiles.map((img, index) => (
                      <div key={index} className="relative aspect-square">
                        <Image
                          src={img.preview}
                          alt={`新图片 ${index + 1}`}
                          width={400}
                          height={400}
                          className="object-cover rounded-lg absolute inset-0 w-full h-full"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 z-10"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  {/* 图片上传按钮 */}
                  {(value?.length || 0) + imageFiles.length < 9 && (
                    <div className="flex items-center justify-center">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        disabled={loading}
                        className="hidden"
                        id="image-upload"
                      />
                      <label 
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg hover:border-primary/50 transition cursor-pointer"
                      >
                        <ImagePlus className="h-10 w-10 text-muted-foreground" />
                        <div className="mt-2 text-sm text-muted-foreground text-center">
                          <span>点击或拖放图片至此处</span>
                          <p className="text-xs">支持 JPG、PNG 格式，每张图片不超过 5MB</p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>使用感受</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="描述产品的使用体验..."
                  className="min-h-[150px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maintenance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>清洁与维护</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="描述产品的清洁和维护方法..."
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pros"
          render={({ field }) => (
            <FormItem>
              <FormLabel>优点</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  {field.value?.map((pro, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={pro}
                        onChange={(e) => {
                          const newPros = [...field.value]
                          newPros[index] = e.target.value
                          form.setValue('pros', newPros)
                        }}
                        placeholder={`优点 ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemovePoint('pros', index)}
                        disabled={field.value.length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddPoint('pros')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    添加优点
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cons"
          render={({ field }) => (
            <FormItem>
              <FormLabel>缺点</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  {field.value?.map((con, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={con}
                        onChange={(e) => {
                          const newCons = [...field.value]
                          newCons[index] = e.target.value
                          form.setValue('cons', newCons)
                        }}
                        placeholder={`缺点 ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemovePoint('cons', index)}
                        disabled={field.value.length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddPoint('cons')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    添加缺点
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="conclusion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>总结</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="对产品进行总体评价..."
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            取消
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? '更新' : '提交'}
          </Button>
        </div>
      </form>
    </Form>
  )
}