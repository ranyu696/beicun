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
import { Loader2 } from 'lucide-react'

// 使用 Prisma 生成的类型并扩展日期为字符串
import type { MaterialType as PrismaMaterialType } from "@prisma/client"

type MaterialType = Omit<PrismaMaterialType, 'createdAt' | 'updatedAt'> & {
  createdAt: string
  updatedAt: string
}

const formSchema = z.object({
  name: z.string().min(1, '请输入类型名称'),
  description: z.string().optional(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean().default(true),
})

type FormValues = z.infer<typeof formSchema>

interface MaterialTypeFormProps {
  initialData?: MaterialType
}

export function MaterialTypeForm({ initialData }: MaterialTypeFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // 从 initialData 中提取表单需要的字段
  const defaultValues: FormValues = {
    name: initialData?.name || '',
    description: initialData?.description || '',
    sortOrder: initialData?.sortOrder || 0,
    isActive: initialData?.isActive ?? true,
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  async function onSubmit(data: FormValues) {
    try {
      setLoading(true)
      
      const response = await fetch(
        initialData 
          ? `/api/categories/material-types/${initialData.id}`
          : '/api/categories/material-types',
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
        description: '材料类型信息已更新'
      })
      
      router.push('/admin/categories/material-types')
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>类型名称</FormLabel>
              <FormControl>
                <Input {...field} placeholder="请输入类型名称" />
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
              <FormLabel>描述</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="请输入类型描述"
                  className="h-32"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sortOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>排序顺序</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value))}
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
                <FormLabel>启用状态</FormLabel>
                <FormDescription>
                  禁用后将不会在前台显示
                </FormDescription>
              </div>
              <FormControl>
                <Switch
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