'use client'

import { useState } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Loader2, ImagePlus } from 'lucide-react'
import Image from 'next/image'

// 使用 Prisma 生成的类型并扩展日期为字符串
import type { Brand as PrismaBrand } from "@prisma/client"

type Brand = Omit<PrismaBrand, 'createdAt' | 'updatedAt'> & {
  createdAt: string
  updatedAt: string
}

const formSchema = z.object({
  name: z.string().min(1, '请输入品牌名称'),
  description: z.string().optional(),
  logo: z.string().optional(),
  website: z.string().url('请输入有效的网址').optional().or(z.literal('')),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean().default(true),
})

type FormValues = z.infer<typeof formSchema>

interface BrandFormProps {
  initialData?: Brand
}

export function BrandForm({ initialData }: BrandFormProps) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // 从 initialData 中提取表单需要的字段
  const defaultValues: FormValues = {
    name: initialData?.name || '',
    description: initialData?.description || '',
    logo: initialData?.logo || '',
    website: initialData?.website || '',
    sortOrder: initialData?.sortOrder || 0,
    isActive: initialData?.isActive ?? true,
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // 处理图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'brand-logo')
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('上传失败')

      const data = await response.json()
      form.setValue('logo', data.url)
      toast({
        title: "上传成功",
        description: "品牌Logo已上传"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "上传失败",
        description: "请稍后重试" + error
      })
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(data: FormValues) {
    try {
      setLoading(true)
      
      const response = await fetch(
        initialData 
          ? `/api/brands/${initialData.id}`
          : '/api/brands',
        {
          method: initialData ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) throw new Error('保存失败')

      toast({
        title: '保存成功',
        description: '品牌信息已更新'
      })
      
      router.push('/admin/brands')
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '保存失败',
        description: '请稍后重试' + error
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="logo">品牌Logo</FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                  {field.value ? (
                    <div className="relative h-20 w-20">
                      <Image
                        src={field.value}
                        alt="Logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-20 w-20 bg-gray-100 rounded-md flex items-center justify-center">
                      <ImagePlus className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <Input
                      id="logo-upload"
                      name="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="max-w-xs"
                      autoComplete="off"
                    />
                    <FormDescription>
                      建议尺寸: 200x200px, 支持 PNG, JPG 格式
                    </FormDescription>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="brand-name">品牌名称</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  id="brand-name"
                  placeholder="请输入品牌名称"
                  autoComplete="organization"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="brand-description">描述</FormLabel>
              <FormControl>
                <Textarea 
                  {...field}
                  id="brand-description"
                  placeholder="请输入品牌描述"
                  className="h-32"
                  autoComplete="off"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="brand-website">官方网站</FormLabel>
              <FormControl>
                <Input 
                  {...field}
                  id="brand-website"
                  placeholder="请输入品牌官网地址"
                  type="url"
                  autoComplete="url"
                />
              </FormControl>
              <FormDescription>
                请输入完整的网址，包含 http:// 或 https://
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sortOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="brand-sort-order">排序顺序</FormLabel>
              <FormControl>
                <Input 
                  {...field}
                  id="brand-sort-order"
                  type="number"
                  value={field.value?.toString() || '0'}
                  onChange={event => {
                    const value = event.target.value === '' ? 0 : parseInt(event.target.value)
                    field.onChange(isNaN(value) ? 0 : value)
                  }}
                  autoComplete="off"
                />
              </FormControl>
              <FormDescription>
                数字越小排序越靠前
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel htmlFor="brand-is-active">启用状态</FormLabel>
                <FormDescription>
                  禁用后将不会在前台显示
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  id="brand-is-active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
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
            保存
          </Button>
        </div>
      </form>
    </Form>
  )
}