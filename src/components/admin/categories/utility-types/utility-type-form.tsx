"use client"

import * as z from "zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Trash, ImagePlus } from "lucide-react"
import { UtilityType } from "@prisma/client"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Heading } from "@/components/ui/heading"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { AlertModal } from "@/components/admin/modals/alert-modal"

const formSchema = z.object({
  name: z.string().min(1, "请输入类型名称"),
  description: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.coerce.number().min(0),
  isActive: z.boolean().default(true),
})

type UtilityTypeFormValues = z.infer<typeof formSchema>

interface UtilityTypeFormProps {
  initialData?: UtilityType
}

export function UtilityTypeForm({
  initialData
}: UtilityTypeFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const title = initialData ? "编辑器具类型" : "创建器具类型"
  const description = initialData ? "编辑器具类型信息" : "添加新的器具类型"
  const toastMessage = initialData ? "器具类型已更新" : "器具类型已创建"
  const action = initialData ? "保存更改" : "创建"

  const form = useForm<UtilityTypeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      icon: initialData?.icon || "",
      sortOrder: initialData?.sortOrder || 0,
      isActive: initialData?.isActive ?? true,
    }
  })

  // 处理图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'utility-type-icon')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('上传失败')
      }

      const data = await response.json()
      form.setValue('icon', data.url)
    } catch (error) {
      toast({
        title: "上传失败",
        description: "图片上传失败，请重试",
        variant: "destructive",
      })
    }
  }

  const onSubmit = async (data: UtilityTypeFormValues) => {
    try {
      setLoading(true)
      if (initialData) {
        await fetch(`/api/utility-types/${initialData.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
      } else {
        await fetch(`/api/utility-types`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
      }
      router.refresh()
      router.push(`/admin/categories/utility-types`)
      toast({
        title: "操作成功",
        description: toastMessage,
      })
    } catch (error) {
      toast({
        title: "操作失败",
        description: "保存失败，请重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      await fetch(`/api/utility-types/${initialData?.id}`, {
        method: 'DELETE',
      })
      router.refresh()
      router.push(`/admin/categories/utility-types`)
      toast({
        title: "删除成功",
        description: "器具类型已删除",
      })
    } catch (error) {
      toast({
        title: "删除失败",
        description: "删除失败，请重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <AlertModal 
        isOpen={open} 
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>图标</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    {field.value && (
                      <div className="relative w-20 h-20">
                        <Image
                          src={field.value}
                          alt="Icon"
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={loading}
                      className="hidden"
                      id="icon-upload"
                    />
                    <label 
                      htmlFor="icon-upload"
                      className="flex items-center justify-center w-20 h-20 border-2 border-dashed rounded-md hover:border-primary/50 transition cursor-pointer"
                    >
                      <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    </label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>名称</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="器具类型名称" {...field} />
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
                  <FormLabel>排序</FormLabel>
                  <FormControl>
                    <Input type="number" disabled={loading} placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      启用
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>描述</FormLabel>
                <FormControl>
                  <Textarea 
                    disabled={loading} 
                    placeholder="器具类型描述" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  )
} 