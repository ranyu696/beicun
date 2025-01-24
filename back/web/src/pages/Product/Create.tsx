import { useNavigate } from 'react-router-dom'
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
import type { CreateProductRequest } from '@/types/product'
import MultiImagePicker from '@/components/common/MultiImagePicker'
import ImageListPicker from '@/components/common/ImageListPicker'
import UrlPicker from '@/components/common/UrlPicker'

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

export default function CreateProduct() {
  const navigate = useNavigate()
  const { toast } = useToast()

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

  // 创建产品
  const createProductMutation = useMutation({
    mutationFn: (data: ProductForm) => {
      const request: CreateProductRequest = {
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
      return productApi.createProduct(request)
    },
    onSuccess: () => {
      toast({ title: '成功', description: '产品创建成功' })
      navigate('/product')
    },
    onError: () => {
      toast({
        title: '错误',
        description: '创建产品失败',
        variant: 'destructive',
      })
    },
  })

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues,
  })

  function onSubmit(data: ProductForm) {
    createProductMutation.mutate(data)
  }

  return (
    <div className="container mx-auto py-8">
      <Form {...form}>
        <form onSubmit={(e) => {
          // 阻止回车键提交表单
          if (e.nativeEvent instanceof KeyboardEvent && e.nativeEvent.key === 'Enter') {
            e.preventDefault();
            return;
          }
          form.handleSubmit(onSubmit)(e);
        }} className="space-y-8">
          {/* 两列布局：左侧基本信息和尺寸重量，右侧产品属性和其他信息 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左侧列 */}
            <div className="space-y-8">
              {/* 基本信息 */}
              <Card>
                <CardHeader>
                  <CardTitle>基本信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 产品名称 */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>产品名称</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="请输入产品名称" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* URL友好名称 */}
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL友好名称</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="系统自动生成" disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 品牌 */}
                  <FormField
                    control={form.control}
                    name="brandId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>品牌</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="请选择品牌" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brandsData?.data?.list.map((brand: Brand) => (
                              <SelectItem key={brand.id} value={brand.id}>
                                {brand.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 价格 */}
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>价格</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" placeholder="请输入价格" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 版本 */}
                  <FormField
                    control={form.control}
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>版本</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="请输入版本" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 注册日期 */}
                  <FormField
                    control={form.control}
                    name="registrationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>注册日期</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} 
                            onChange={e => field.onChange(new Date(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* 尺寸和重量 */}
              <Card>
                <CardHeader>
                  <CardTitle>尺寸和重量</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {/* 高度 */}
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>高度 (mm)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.1" placeholder="请输入高度" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 宽度 */}
                    <FormField
                      control={form.control}
                      name="width"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>宽度 (mm)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.1" placeholder="请输入宽度" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 长度 */}
                    <FormField
                      control={form.control}
                      name="length"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>长度 (mm)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.1" placeholder="请输入长度" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 通道长度 */}
                    <FormField
                      control={form.control}
                      name="channelLength"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>通道长度 (mm)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.1" placeholder="请输入通道长度" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 总长度 */}
                    <FormField
                      control={form.control}
                      name="totalLength"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>总长度 (mm)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.1" placeholder="请输入总长度" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* 重量 */}
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>重量 (g)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.1" placeholder="请输入重量" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧列 */}
            <div className="space-y-8">
              {/* 产品类型 */}
              <Card>
                <CardHeader>
                  <CardTitle>产品类型</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 产品类型 */}
                  <FormField
                    control={form.control}
                    name="productTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>产品类型</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="请选择产品类型" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {productTypes?.data?.list.map((type: Type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 通道类型 */}
                  <FormField
                    control={form.control}
                    name="channelTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>通道类型</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="请选择通道类型" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {channelTypes?.data?.list.map((type: Type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 材质类型 */}
                  <FormField
                    control={form.control}
                    name="materialTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>材质类型</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="请选择材质类型" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {materialTypes?.data?.list.map((type: Type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 功能类型 */}
                  <FormField
                    control={form.control}
                    name="utilityTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>功能类型</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="请选择功能类型" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {utilityTypes?.data?.list.map((type: Type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* 产品属性 */}
              <Card>
                <CardHeader>
                  <CardTitle>产品属性</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-6">
                  {/* 刺激度 */}
                  <FormField
                    control={form.control}
                    name="stimulation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>刺激度</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="请选择刺激度" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LOW">低</SelectItem>
                            <SelectItem value="MEDIUM">中</SelectItem>
                            <SelectItem value="HIGH">高</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 软硬度 */}
                  <FormField
                    control={form.control}
                    name="softness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>软硬度</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="请选择软硬度" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ULTRA_SOFT">极软</SelectItem>
                            <SelectItem value="SOFT">软</SelectItem>
                            <SelectItem value="MEDIUM">中等</SelectItem>
                            <SelectItem value="HARD">硬</SelectItem>
                            <SelectItem value="ULTRA_HARD">极硬</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 紧致度 */}
                  <FormField
                    control={form.control}
                    name="tightness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>紧致度</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="请选择紧致度" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="TIGHT">紧</SelectItem>
                            <SelectItem value="MEDIUM">中等</SelectItem>
                            <SelectItem value="LOOSE">松</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 气味 */}
                  <FormField
                    control={form.control}
                    name="smell"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>气味</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="请选择气味程度" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LOW">低</SelectItem>
                            <SelectItem value="MEDIUM">中</SelectItem>
                            <SelectItem value="HIGH">高</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 油性 */}
                  <FormField
                    control={form.control}
                    name="oiliness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>油性</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="请选择油性程度" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LOW">低</SelectItem>
                            <SelectItem value="MEDIUM">中</SelectItem>
                            <SelectItem value="HIGH">高</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 耐用度 */}
                  <FormField
                    control={form.control}
                    name="durability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>耐用度</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="请选择耐用度" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LOW">低</SelectItem>
                            <SelectItem value="MEDIUM">中</SelectItem>
                            <SelectItem value="HIGH">高</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 是否可翻转 */}
                  <FormField
                    control={form.control}
                    name="isReversible"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>是否可翻转</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="请选择是否可翻转" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="true">是</SelectItem>
                            <SelectItem value="false">否</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 描述 */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>描述</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="请输入产品描述" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 淘宝链接 */}
                  <FormField
                    control={form.control}
                    name="taobaoUrl"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>淘宝链接</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="请输入淘宝链接" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                </CardContent>
              </Card>
            </div>
          </div>

          {/* 图片和视频 */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>图片和视频</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* 主图 */}
              <FormField
                control={form.control}
                name="mainImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>主图</FormLabel>
                    <FormControl>
                      <MultiImagePicker
                        value={field.value}
                        onChange={field.onChange}
                        maxCount={5}
                        gridCols={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 销售图 */}
              <FormField
                control={form.control}
                name="salesImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>销售图</FormLabel>
                    <FormControl>
                      <MultiImagePicker
                        value={field.value}
                        onChange={field.onChange}
                        maxCount={50}
                        gridCols={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 产品图片 */}
              <FormField
                control={form.control}
                name="productImages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>产品图片</FormLabel>
                    <FormControl>
                      <ImageListPicker
                        value={field.value}
                        onChange={field.onChange}
                        maxCount={10}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 视频 */}
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>视频</FormLabel>
                    <FormControl>
                      <UrlPicker
                        {...field}
                        accept="video"
                        placeholder="请选择视频"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 视频选择器 */}
              {/* <FilePickerDialog
                open={videoPickerOpen}
                onOpenChange={setVideoPickerOpen}
                onSelect={(url) => {
                  form.setValue('videoUrl', url)
                  setVideoPickerOpen(false)
                }}
                accept="video"
                title="选择视频"
              /> */}
            </CardContent>
          </Card>

          {/* 提交按钮 */}
          <div className="flex justify-end space-x-2 mt-8">
            <Button variant="outline" onClick={() => navigate('/product')}>
              取消
            </Button>
            <Button type="submit">提交</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
