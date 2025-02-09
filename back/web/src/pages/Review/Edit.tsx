import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, ArrowLeft } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import FilePickerDialog from '@/components/common/FilePickerDialog'
import { reviewApi } from '@/services/review'
import { type UpdateReviewRequest } from '@/types/review'
import { useToast } from '@/hooks/use-toast'
import { MinimalTiptapEditor } from '@/components/minimal-tiptap'
import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const formSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  content: z.string().min(1, '内容不能为空'),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  conclusion: z.string().min(1, '总结不能为空'),
  status: z.enum(['PENDING', 'PUBLISHED', 'ARCHIVED']),
  cover: z.string(),
})

type FormValues = z.infer<typeof formSchema>

export default function ReviewEdit() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const { id } = useParams()
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  // 获取评价详情
  const { data: reviewData, isLoading } = useQuery({
    queryKey: ['review', id],
    queryFn: () => reviewApi.getReview(id!),
    enabled: !!id,
  })

  // 初始化表单
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      pros: [''],
      cons: [''],
      conclusion: '',
      status: 'ARCHIVED',
      cover: '',
    },
  })

  // 当数据加载完成后更新表单
  useEffect(() => {
    const review = reviewData?.data
    if (review) {
      console.log('Setting form values:', review)
      // 使用 setTimeout 确保编辑器已经完全初始化
      setTimeout(() => {
        form.reset({
          title: review.title || '',
          content: review.content || '',
          pros: review.pros?.length > 0 ? review.pros : [''],
          cons: review.cons?.length > 0 ? review.cons : [''],
          conclusion: review.conclusion || '',
          status: review.status || 'ARCHIVED',
          cover: review.cover || '',
        })
      }, 0)
    }
  }, [reviewData, form])

  // 更新评价
  const { mutate: updateReview, isPending } = useMutation({
    mutationFn: async (data: UpdateReviewRequest) => {
      const response = await reviewApi.updateReview(id!, data)
      return response.data
    },
    onSuccess: () => {
      toast({
        title: '更新成功',
        description: '评价已更新',
      })
      navigate('/review')
    },
    onError: () => {
      toast({
        title: '更新失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    },
  })

  // 提交表单
  const onSubmit = (values: FormValues) => {
    if (!values.cover) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "请选择封面图片",
      })
      return
    }
    console.log('Submitting values:', values)
    updateReview(values)
  }

  // 处理添加优点/缺点
  const handleAddPoint = (type: 'pros' | 'cons') => {
    const currentValues = form.getValues(type)
    form.setValue(type, [...currentValues, ''])
  }

  // 处理删除优点/缺点
  const handleRemovePoint = (type: 'pros' | 'cons', index: number) => {
    const currentValues = form.getValues(type)
    if (currentValues.length > 1) {
      form.setValue(
        type,
        currentValues.filter((_, i) => i !== index)
      )
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/review')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">编辑评价</h1>
          <p className="text-sm text-muted-foreground">
            编辑用户对产品 {reviewData?.data?.product?.name || '未知产品'} 的评价
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>标题</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>内容</FormLabel>
                <FormControl>
                  <MinimalTiptapEditor
                    key={field.value} // 添加 key 属性以强制重新渲染
                    value={field.value}
                    onChange={field.onChange}
                    className="w-full min-h-[400px]"
                    editorContentClassName="p-5"
                    output="html"
                    placeholder="请输入正文内容..."
                    autofocus={false}
                    editable={true}
                    editorClassName="focus:outline-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 优点 */}
          <div className="space-y-4">
            <Label>优点</Label>
            {form.watch('pros').map((_, index) => (
              <FormField
                key={index}
                control={form.control}
                name={`pros.${index}`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input {...field} placeholder="请输入优点" />
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => handleRemovePoint('pros', index)}
                          disabled={form.watch('pros').length === 1}
                        >
                          删除
                        </Button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => handleAddPoint('pros')}
            >
              添加优点
            </Button>
          </div>

          {/* 缺点 */}
          <div className="space-y-4">
            <Label>缺点</Label>
            {form.watch('cons').map((_, index) => (
              <FormField
                key={index}
                control={form.control}
                name={`cons.${index}`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input {...field} placeholder="请输入缺点" />
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => handleRemovePoint('cons', index)}
                          disabled={form.watch('cons').length === 1}
                        >
                          删除
                        </Button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => handleAddPoint('cons')}
            >
              添加缺点
            </Button>
          </div>

          <FormField
            control={form.control}
            name="conclusion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>总结</FormLabel>
                <FormControl>
                  <MinimalTiptapEditor
                    key={field.value} // 添加 key 属性以强制重新渲染
                    value={field.value}
                    onChange={field.onChange}
                    className="w-full min-h-[200px]"
                    editorContentClassName="p-5"
                    output="html"
                    placeholder="请输入结论..."
                    autofocus={false}
                    editable={true}
                    editorClassName="focus:outline-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 封面图片 */}
          <FormField
            control={form.control}
            name="cover"
            render={({ field }) => (
              <FormItem>
                <FormLabel>封面图片</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input {...field} readOnly placeholder="请选择封面图片" />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsPickerOpen(true)}
                    >
                      选择图片
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>状态</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PUBLISHED">已发布</SelectItem>
                    <SelectItem value="PENDING">已下架</SelectItem>
                    <SelectItem value="ARCHIVED">草稿</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/review')}
            >
              取消
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存
            </Button>
          </div>
        </form>
      </Form>

      <FilePickerDialog
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        accept="image"
        title="选择图片"
        onSelect={(url) => {
          form.setValue('cover', url)
          setIsPickerOpen(false)
        }}
      />
    </div>
  )
}