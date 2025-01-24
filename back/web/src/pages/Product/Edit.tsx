import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { brandApi } from '@/services/brand'
import { productApi } from '@/services/product'
import { 
  productTypeApi,
  channelTypeApi,
  materialTypeApi,
  utilityTypeApi,
} from '@/services/type'
import type { Brand } from '@/types/brand'
import type { Type } from '@/types/type'
import type { PageResponse } from '@/types/api'
import { useToast } from '@/hooks/use-toast'
import type { UpdateProductRequest } from '@/types/product'
import MultiImagePicker from '@/components/common/MultiImagePicker'
import ImageListPicker from '@/components/common/ImageListPicker'
import UrlPicker from '@/components/common/UrlPicker'
import { useEffect } from 'react'
import { format } from 'date-fns'
import { Textarea } from '@/components/ui/textarea'

// 图片验证schema
const imageSchema = z.object({
  url: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  sort: z.number(),
})

// 详情图验证schema
const productImageSchema = imageSchema.extend({
  description: z.string().optional(),
})

// 产品表单验证schema
const productSchema = z.object({
  name: z.string().min(1, '请输入产品名称'),
  slug: z.string(),  
  brandId: z.string().min(1, '请选择品牌'),
  productTypeId: z.string().min(1, '请选择产品类型'),
  channelTypeId: z.string().min(1, '请选择通道类型'),
  materialTypeId: z.string().min(1, '请选择材质类型'),
  utilityTypeId: z.string().min(1, '请选择实用类型'),
  price: z.string().min(1, '请输入价格'),
  height: z.string().min(1, '请输入高度'),
  width: z.string().min(1, '请输入宽度'),
  length: z.string().min(1, '请输入长度'),
  channelLength: z.string().min(1, '请输入通道长度'),
  totalLength: z.string().min(1, '请输入总长度'),
  weight: z.string().min(1, '请输入重量'),
  version: z.string().min(1, '请输入版本'),
  isReversible: z.string(),
  stimulation: z.enum(['LOW', 'MEDIUM', 'HIGH'] as const),
  softness: z.enum(['ULTRA_SOFT', 'SOFT', 'MEDIUM', 'HARD', 'ULTRA_HARD'] as const),
  tightness: z.enum(['TIGHT', 'MEDIUM', 'LOOSE'] as const),
  smell: z.enum(['HIGH', 'MEDIUM', 'LOW'] as const),
  oiliness: z.enum(['HIGH', 'MEDIUM', 'LOW'] as const),
  durability: z.enum(['HIGH', 'MEDIUM', 'LOW'] as const),
  description: z.string().optional(),
  taobaoUrl: z.string().optional(),
  mainImage: z.array(imageSchema),
  salesImage: z.array(imageSchema),
  productImages: z.array(productImageSchema).optional(),
  videoUrl: z.string().optional(),
  registrationDate: z.date({
    required_error: "请选择注册日期",
  }),
})

type ProductForm = z.infer<typeof productSchema>

const defaultValues: ProductForm = {
  name: '',
  slug: '',
  brandId: '',
  productTypeId: '',
  channelTypeId: '',
  materialTypeId: '',
  utilityTypeId: '',
  price: '',
  height: '',
  width: '',
  length: '',
  channelLength: '',
  totalLength: '',
  weight: '',
  version: '',
  isReversible: 'false',
  stimulation: 'MEDIUM',
  softness: 'MEDIUM',
  tightness: 'MEDIUM',
  smell: 'MEDIUM',
  oiliness: 'MEDIUM',
  durability: 'MEDIUM',
  description: '',
  taobaoUrl: '',
  mainImage: [],
  salesImage: [],
  productImages: [],
  videoUrl: '',
  registrationDate: new Date(),
}

export default function EditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  // 获取产品详情
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await productApi.getProduct(id!)
      console.log('API Response:', response)  
      return response
    },
    enabled: !!id,
  })

  // 获取品牌列表
  const { data: brandsData } = useQuery<PageResponse<Brand>>({
    queryKey: ['brands'],
    queryFn: () => brandApi.getBrands({ page: 1, pageSize: 100 }),
  })

  // 获取产品类型列表
  const { data: productTypes } = useQuery<PageResponse<Type>>({
    queryKey: ['productTypes'],
    queryFn: () => productTypeApi.getTypes({ page: 1, pageSize: 100 }),
  })

  // 获取通道类型列表
  const { data: channelTypes } = useQuery<PageResponse<Type>>({
    queryKey: ['channelTypes'],
    queryFn: () => channelTypeApi.getTypes({ page: 1, pageSize: 100 }),
  })

  // 获取材质类型列表
  const { data: materialTypes } = useQuery<PageResponse<Type>>({
    queryKey: ['materialTypes'],
    queryFn: () => materialTypeApi.getTypes({ page: 1, pageSize: 100 }),
  })

  // 获取功能类型列表
  const { data: utilityTypes } = useQuery<PageResponse<Type>>({
    queryKey: ['utilityTypes'],
    queryFn: () => utilityTypeApi.getTypes({ page: 1, pageSize: 100 }),
  })

  // 更新产品
  const updateProductMutation = useMutation({
    mutationFn: (data: ProductForm) => {
      const request: UpdateProductRequest = {
        ...data,
        price: Number(data.price),
        height: Number(data.height),
        width: Number(data.width),
        length: Number(data.length),
        channelLength: Number(data.channelLength),
        totalLength: Number(data.totalLength),
        weight: Number(data.weight),
        isReversible: data.isReversible === 'true',
        mainImage: data.mainImage.map((image) => ({
          url: image.url,
          width: image.width || 0,
          height: image.height || 0,
          sort: image.sort || 0,
        })),
        salesImage: data.salesImage.map((image) => ({
          url: image.url,
          width: image.width || 0,
          height: image.height || 0,
          sort: image.sort || 0,
        })),
        productImages: data.productImages?.map((image) => ({
          url: image.url,
          width: image.width || 0,
          height: image.height || 0,
          sort: image.sort || 0,
          description: image.description || '',
        })),
        videoUrl: data.videoUrl,
      }
      return productApi.updateProduct(id!, request)
    },
    onSuccess: () => {
      toast({ title: '成功', description: '产品更新成功' })
      navigate('/product')
    },
    onError: () => {
      toast({
        title: '错误',
        description: '更新产品失败',
        variant: 'destructive',
      })
    },
  })

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues,
  })

  useEffect(() => {
    if (product?.data) {
      console.log('Setting form data:', product.data)  
      const formData = {
        name: product.data.name || '',
        slug: product.data.slug || '',
        brandId: product.data.brandId || '',
        productTypeId: product.data.productTypeId || '',
        channelTypeId: product.data.channelTypeId || '',
        materialTypeId: product.data.materialTypeId || '',
        utilityTypeId: product.data.utilityTypeId || '',
        price: (product.data.price || 0).toString(),
        height: (product.data.height || 0).toString(),
        width: (product.data.width || 0).toString(),
        length: (product.data.length || 0).toString(),
        channelLength: (product.data.channelLength || 0).toString(),
        totalLength: (product.data.totalLength || 0).toString(),
        weight: (product.data.weight || 0).toString(),
        version: product.data.version || '',
        isReversible: product.data.isReversible ? 'true' : 'false',
        stimulation: product.data.stimulation || 'MEDIUM',
        softness: product.data.softness || 'MEDIUM',
        tightness: product.data.tightness || 'MEDIUM',
        smell: product.data.smell || 'MEDIUM',
        oiliness: product.data.oiliness || 'MEDIUM',
        durability: product.data.durability || 'MEDIUM',
        description: product.data.description || '',
        taobaoUrl: product.data.taobaoUrl || '',
        mainImage: Array.isArray(product.data.mainImage) ? product.data.mainImage : [],
        salesImage: Array.isArray(product.data.salesImage) ? product.data.salesImage : [],
        productImages: Array.isArray(product.data.productImages) ? product.data.productImages : [],
        videoUrl: product.data.videoUrl || '',
        registrationDate: product.data.registrationDate ? new Date(product.data.registrationDate) : new Date(),
      }
      console.log('Form data to set:', formData)  
      form.reset(formData)
    }
  }, [product?.data, form])

  const onSubmit = async (data: ProductForm) => {
    console.log('Submitting form data:', data)  
    updateProductMutation.mutate(data)
  }

  if (isLoadingProduct) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-center text-muted-foreground">加载中...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!product?.data) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-center text-muted-foreground">未找到产品</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>编辑产品</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>产品名称</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>品牌</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择品牌" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brandsData?.data?.list?.map((brand: Brand) => (
                            <SelectItem
                              key={brand.id}
                              value={brand.id}
                            >
                              {brand.name}
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
                  name="productTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>产品类型</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择产品类型" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {productTypes?.data?.list?.map((type: Type) => (
                            <SelectItem
                              key={type.id}
                              value={type.id}
                            >
                              {type.name}
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
                  name="channelTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>通道类型</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择通道类型" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {channelTypes?.data?.list?.map((type: Type) => (
                            <SelectItem
                              key={type.id}
                              value={type.id}
                            >
                              {type.name}
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
                  name="materialTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>材质类型</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择材质类型" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {materialTypes?.data?.list?.map((type: Type) => (
                            <SelectItem
                              key={type.id}
                              value={type.id}
                            >
                              {type.name}
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
                  name="utilityTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>功能类型</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择功能类型" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {utilityTypes?.data?.list?.map((type: Type) => (
                            <SelectItem
                              key={type.id}
                              value={type.id}
                            >
                              {type.name}
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
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>价格</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>高度</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>宽度</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>长度</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="channelLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>通道长度</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>总长度</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>重量</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>版本</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isReversible"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>是否可逆</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => field.onChange(value === 'true')}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="是否可逆" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="true">是</SelectItem>
                            <SelectItem value="false">否</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stimulation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>刺激程度</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="刺激程度" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LOW">低</SelectItem>
                            <SelectItem value="MEDIUM">中</SelectItem>
                            <SelectItem value="HIGH">高</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="softness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>软硬程度</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="软硬程度" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ULTRA_SOFT">非常软</SelectItem>
                            <SelectItem value="SOFT">软</SelectItem>
                            <SelectItem value="MEDIUM">中</SelectItem>
                            <SelectItem value="HARD">硬</SelectItem>
                            <SelectItem value="ULTRA_HARD">非常硬</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tightness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>紧密程度</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="紧密程度" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="TIGHT">紧</SelectItem>
                            <SelectItem value="MEDIUM">中</SelectItem>
                            <SelectItem value="LOOSE">松</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smell"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>气味</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="气味" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="HIGH">强</SelectItem>
                            <SelectItem value="MEDIUM">中</SelectItem>
                            <SelectItem value="LOW">弱</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="oiliness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>油腻程度</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="油腻程度" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="HIGH">高</SelectItem>
                            <SelectItem value="MEDIUM">中</SelectItem>
                            <SelectItem value="LOW">低</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="durability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>耐用程度</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="耐用程度" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="HIGH">高</SelectItem>
                            <SelectItem value="MEDIUM">中</SelectItem>
                            <SelectItem value="LOW">低</SelectItem>
                          </SelectContent>
                        </Select>
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
                      <FormLabel>产品描述</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taobaoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>淘宝链接</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mainImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>主图</FormLabel>
                      <FormControl>
                        <MultiImagePicker
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salesImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>销售图</FormLabel>
                      <FormControl>
                        <MultiImagePicker
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productImages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>详情图</FormLabel>
                      <FormControl>
                        <ImageListPicker
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>视频链接</FormLabel>
                      <FormControl>
                        <UrlPicker
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registrationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>注册日期</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoadingProduct || updateProductMutation.isPending}
                >
                  {updateProductMutation.isPending ? '更新中...' : '更新产品'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  )
}
