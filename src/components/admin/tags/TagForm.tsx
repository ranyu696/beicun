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
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  name: z.string().min(1, '请输入标签名称'),
})

type FormValues = z.infer<typeof formSchema>

interface TagFormProps {
  initialData?: {
    id: string
    name: string
  }
}

export function TagForm({ initialData }: TagFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
    },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true)
      const url = initialData 
        ? `/api/tags/${initialData.id}`
        : '/api/tags'
      const method = initialData ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '提交失败')
      }

      toast({
        title: initialData ? "更新成功" : "创建成功",
        description: initialData ? "标签已更新" : "标签已创建"
      })

      router.push('/admin/tags')
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>标签名称</FormLabel>
              <FormControl>
                <Input {...field} placeholder="输入标签名称" />
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
            {initialData ? '更新' : '创建'}
          </Button>
        </div>
      </form>
    </Form>
  )
}