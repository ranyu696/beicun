import { useNavigate } from 'react-router-dom'
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
import { useMutation } from '@tanstack/react-query'
import { brandApi } from '@/services/brand'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import MediaPicker from '@/components/common/MediaPicker'

const brandSchema = z.object({
  name: z.string().min(1, '品牌名称不能为空'),
  description: z.string().optional(),
  logo: z.string().optional(),
  website: z.string().url('请输入有效的网址').optional(),
  sortOrder: z.number().min(0, '排序值不能小于0').default(0),
})

type BrandForm = z.infer<typeof brandSchema>

export default function CreateBrand() {
  const navigate = useNavigate()
  const { toast } = useToast()

  // 创建品牌
  const createBrandMutation = useMutation({
    mutationFn: (data: BrandForm) => brandApi.createBrand(data),
    onSuccess: () => {
      toast({ title: '成功', description: '品牌创建成功' })
      navigate('/brand')
    },
    onError: () => {
      toast({
        title: '错误',
        description: '创建品牌失败',
        variant: 'destructive',
      })
    },
  })

  const form = useForm<BrandForm>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: '',
      description: '',
      logo: '',
      website: '',
      sortOrder: 0,
    },
  })

  function onSubmit(data: BrandForm) {
    createBrandMutation.mutate(data)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">创建品牌</h2>
          <p className="text-muted-foreground">
            添加新的品牌到系统中
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/brand')}>
          返回
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>品牌信息</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>品牌名称</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>品牌描述</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>品牌Logo</FormLabel>
                    <FormControl>
                      <MediaPicker
                        value={field.value}
                        onChange={field.onChange}
                        accept="image"
                        placeholder="选择或上传品牌Logo"
                        maxSize={2}
                        folderId="brand-logos"
                        folderName="品牌Logo"
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
                    <FormLabel>官网</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://" {...field} />
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
                      <Input 
                        type="number" 
                        min={0}
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/brand')}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={createBrandMutation.isPending}
                >
                  {createBrandMutation.isPending ? '创建中...' : '创建品牌'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
