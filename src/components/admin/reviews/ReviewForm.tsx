'use client'

import { useState } from 'react'
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
import { TiptapEditor } from "@/components/admin/editor/tiptap-editor"

const formSchema = z.object({
  title: z.string().min(1, '请输入标题'),
  productId: z.string().min(1, '请选择产品'),
  unboxing: z.string().min(1, '请填写开箱体验'),
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
  const { toast } = useToast()
  const router = useRouter()

  const defaultValues: Partial<FormValues> = {
    title: initialData?.title || '',
    productId: initialData?.productId || '',
    unboxing: initialData?.unboxing || '',
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

  // 提交表单
  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true)

      const url = initialData 
        ? `/api/reviews/${initialData.id}`
        : '/api/reviews'
      const method = initialData ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
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
                <TiptapEditor
                  content={field.value}
                  onChange={field.onChange}
                  placeholder="描述产品的开箱体验..."
                  disabled={loading}
                />
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
                <TiptapEditor
                  content={field.value}
                  onChange={field.onChange}
                  placeholder="描述产品的使用体验..."
                  disabled={loading}
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
                <TiptapEditor
                  content={field.value}
                  onChange={field.onChange}
                  placeholder="描述产品的清洁和维护方法..."
                  disabled={loading}
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
                <TiptapEditor
                  content={field.value}
                  onChange={field.onChange}
                  placeholder="对产品进行总体评价..."
                  disabled={loading}
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