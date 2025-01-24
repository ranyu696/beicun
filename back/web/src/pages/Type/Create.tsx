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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { utilityTypeApi, productTypeApi, channelTypeApi, materialTypeApi } from '@/services/type'
import { type TypeKind } from '@/types/type'

const formSchema = z.object({
  name: z.string().min(1, '类型名称不能为空'),
  description: z.string().optional(),
  sortOrder: z.number().min(0, '排序值不能小于0').default(0),
})

type TypeForm = z.infer<typeof formSchema>

interface TypeConfig {
  title: string
  api: typeof utilityTypeApi
  path: string
}

interface CreateTypeProps {
  type: TypeKind
}

const typeConfigs: Record<TypeKind, TypeConfig> = {
  utility: {
    title: '器具类型',
    api: utilityTypeApi,
    path: '/types/utility',
  },
  product: {
    title: '产品类型',
    api: productTypeApi,
    path: '/types/product',
  },
  channel: {
    title: '通道类型',
    api: channelTypeApi,
    path: '/types/channel',
  },
  material: {
    title: '材料类型',
    api: materialTypeApi,
    path: '/types/material',
  },
}

export default function CreateType({ type }: CreateTypeProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const currentType = typeConfigs[type]

  const { mutate: createType, isPending } = useMutation({
    mutationFn: (data: TypeForm) => currentType.api.createType(data),
    onSuccess: () => {
      toast({
        title: '成功',
        description: '创建成功',
      })
      navigate(currentType.path)
    },
    onError: () => {
      toast({
        title: '错误',
        description: '创建失败',
        variant: 'destructive',
      })
    },
  })

  const form = useForm<TypeForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      sortOrder: 0,
    },
  })

  function onSubmit(data: TypeForm) {
    createType(data)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">创建{currentType.title}</h2>
          <p className="text-muted-foreground">
            添加新的{currentType.title}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(currentType.path)}>
          返回
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{currentType.title}信息</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>名称</FormLabel>
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
                    <FormLabel>描述</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
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
                  onClick={() => navigate(currentType.path)}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? '创建中...' : `创建${currentType.title}`}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
