"use client"

import * as z from "zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ProductRating } from "@prisma/client"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  reason: z.string().optional(),
  productId: z.string().min(1, "请选择产品"),
  userId: z.string().min(1, "请选择用户"),
})

type RatingFormValues = z.infer<typeof formSchema>

interface RatingFormProps {
  initialData?: ProductRating
  products: { id: string; name: string }[]
  users: { id: string; name: string }[]
}

export function RatingForm({
  initialData,
  products,
  users,
}: RatingFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const title = initialData ? "编辑评分" : "添加评分"
  const description = initialData ? "编辑评分信息" : "添加新的评分"
  const toastMessage = initialData ? "评分已更新" : "评分已创建"
  const action = initialData ? "保存更改" : "创建"

  const form = useForm<RatingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: initialData?.rating || 5,
      reason: initialData?.reason || "",
      productId: initialData?.productId || "",
      userId: initialData?.userId || "",
    }
  })

  const onSubmit = async (data: RatingFormValues) => {
    try {
      setLoading(true)
      if (initialData) {
        await fetch(`/api/ratings/${initialData.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
      } else {
        await fetch(`/api/ratings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
      }
      router.refresh()
      router.push(`/admin/ratings`)
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

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
            <div className="grid grid-cols-3 gap-8">
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>产品</FormLabel>
                    <Select 
                      disabled={loading} 
                      onValueChange={field.onChange} 
                      value={field.value} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue defaultValue={field.value} placeholder="选择产品" />
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
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>用户</FormLabel>
                    <Select 
                      disabled={loading} 
                      onValueChange={field.onChange} 
                      value={field.value} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue defaultValue={field.value} placeholder="选择用户" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name || '匿名用户'}
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
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>评分</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={5} step={0.1} disabled={loading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>评分理由</FormLabel>
                  <FormControl>
                    <Textarea 
                      disabled={loading} 
                      placeholder="请输入评分理由" 
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
      </div>
    </div>
  )
} 