import { useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation } from '@tanstack/react-query'
import { brandApi } from '@/services/brand'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import MediaPicker from '@/components/common/MediaPicker'

const brandSchema = z.object({
  name: z.string().min(1, '品牌名称不能为空'),
  description: z.string().optional(),
  logo: z.string().optional(),
  website: z.string().url('请输入有效的网址').optional(),
  sortOrder: z.number().min(0, '排序值不能小于0').default(0),
})

type BrandForm = z.infer<typeof brandSchema>

export default function EditBrand() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { toast } = useToast()

  const { data: brandData, isLoading: isLoadingBrand } = useQuery({
    queryKey: ['brand', id],
    queryFn: async () => {
      const response = await brandApi.getBrand(id!)
      return response.data
    },
    enabled: !!id,
  })

  const { mutate: updateBrand, isPending: isUpdatingBrand } = useMutation({
    mutationFn: async (data: BrandForm) => {
      const response = await brandApi.updateBrand(id!, data)
      return response.data
    },
    onSuccess: () => {
      toast({
        title: '更新成功',
      })
      navigate('/brand/list')
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

  useEffect(() => {
    if (brandData) {
      form.reset({
        name: brandData.name,
        description: brandData.description,
        logo: brandData.logo,
        website: brandData.website,
        sortOrder: brandData.sortOrder,
      })
    }
  }, [brandData, form])

  function onSubmit(data: BrandForm) {
    updateBrand(data)
  }

  if (isLoadingBrand) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>编辑品牌</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                取消
              </Button>
              <Button type="submit" disabled={isUpdatingBrand}>
                {isUpdatingBrand ? '保存中...' : '保存修改'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
