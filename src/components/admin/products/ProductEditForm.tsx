'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
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
import { Loader2 } from 'lucide-react'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { MultiSelect, MultiSelectValue, MultiSelectTrigger, MultiSelectContent, MultiSelectItem } from '@/components/ui/multi-select'
import { Badge } from '@/components/ui/badge'

// 表单验证 Schema
const formSchema = z.object({
  // 基本信息
  name: z.string().min(1, '请输入产品名称'),
  slug: z.string().min(1, '请输入URL标识'),
  price: z.string().min(1, '请输入产品价格'),
  description: z.string().optional(),
  taobaoUrl: z.string().optional(),
  
  // 关联ID
  brandId: z.string().min(1, '请选择品牌'),
  productTypeId: z.string().min(1, '请选择产品类型'),
  channelTypeId: z.string().min(1, '请选择通道类型'),
  materialTypeId: z.string().min(1, '请选择材料类型'),
  utilityTypeId: z.string().min(1, '请选择用途类型'),
  
  // 规格参数
  registrationDate: z.string().optional(),
  height: z.string().optional(),
  width: z.string().optional(),
  length: z.string().optional(),
  channelLength: z.string().optional(),
  totalLength: z.string().optional(),
  weight: z.string().optional(),
  version: z.string().optional(),
  isReversible: z.boolean().optional(),
  
  // 产品特性
  stimulation: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  softness: z.enum(['ULTRA_SOFT', 'SOFT', 'MEDIUM', 'HARD', 'ULTRA_HARD']).optional(),
  tightness: z.enum(['TIGHT', 'MEDIUM', 'LOOSE']).optional(),
  smell: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  oiliness: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  
  // 标签
  tagIds: z.array(z.string()).optional()
})

interface ProductEditFormProps {
  productData: {
    id: string
    name: string
    slug: string
    price: number
    brandId: string
    productTypeId: string
    channelTypeId: string
    materialTypeId: string
    utilityTypeId: string
    description: string | null
    taobaoUrl: string | null
    registrationDate: Date | null
    height: number | null
    width: number | null
    length: number | null
    channelLength: number | null
    totalLength: number | null
    weight: number | null
    version: string | null
    isReversible: boolean
    stimulation: 'LOW' | 'MEDIUM' | 'HIGH' | null
    softness: 'ULTRA_SOFT' | 'SOFT' | 'MEDIUM' | 'HARD' | 'ULTRA_HARD' | null
    tightness: 'TIGHT' | 'MEDIUM' | 'LOOSE' | null
    smell: 'HIGH' | 'MEDIUM' | 'LOW' | null
    oiliness: 'HIGH' | 'MEDIUM' | 'LOW' | null
    tags: Array<{
      tag: {
        id: string
        name: string
      }
    }>
  }
  brands: Array<{ id: string; name: string }>
  productTypes: Array<{ id: string; name: string }>
  channelTypes: Array<{ id: string; name: string }>
  materialTypes: Array<{ id: string; name: string }>
  utilityTypes: Array<{ id: string; name: string }>
  tags: Array<{ id: string; name: string }>
}

// 定义数值字段类型
type NumericFields = 'price' | 'height' | 'width' | 'length' | 'channelLength' | 'totalLength' | 'weight';

// 检查是否是数值字段
function isNumericField(key: string): key is NumericFields {
  return ['price', 'height', 'width', 'length', 'channelLength', 'totalLength', 'weight'].includes(key)
}

export function ProductEditForm({ 
  productData,
  brands = [],
  productTypes = [],
  channelTypes = [],
  materialTypes = [],
  utilityTypes = [],
  tags = []
}: ProductEditFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // 初始化表单
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: productData.name,
      slug: productData.slug,
      price: productData.price.toString(),
      description: productData.description ?? '',
      taobaoUrl: productData.taobaoUrl ?? '',
      brandId: productData.brandId,
      productTypeId: productData.productTypeId,
      channelTypeId: productData.channelTypeId,
      materialTypeId: productData.materialTypeId,
      utilityTypeId: productData.utilityTypeId,
      registrationDate: productData.registrationDate?.toISOString().split('T')[0] ?? '',
      height: productData.height?.toString() ?? '',
      width: productData.width?.toString() ?? '',
      length: productData.length?.toString() ?? '',
      channelLength: productData.channelLength?.toString() ?? '',
      totalLength: productData.totalLength?.toString() ?? '',
      weight: productData.weight?.toString() ?? '',
      version: productData.version ?? '',
      isReversible: productData.isReversible,
      stimulation: productData.stimulation ?? undefined,
      softness: productData.softness ?? undefined,
      tightness: productData.tightness ?? undefined,
      smell: productData.smell ?? undefined,
      oiliness: productData.oiliness ?? undefined,
      tagIds: productData.tags.map(t => t.tag.id)
    }
  })

  // 提交表单
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)

      // 定义更新数据的类型
      type UpdateData = {
        name?: string;
        slug?: string;
        price?: number;
        description?: string | null;
        taobaoUrl?: string | null;
        brandId?: string;
        productTypeId?: string;
        channelTypeId?: string;
        materialTypeId?: string;
        utilityTypeId?: string;
        registrationDate?: string;
        height?: number;
        width?: number;
        length?: number;
        channelLength?: number;
        totalLength?: number;
        weight?: number;
        version?: string;
        isReversible?: boolean;
        stimulation?: 'LOW' | 'MEDIUM' | 'HIGH';
        softness?: 'ULTRA_SOFT' | 'SOFT' | 'MEDIUM' | 'HARD' | 'ULTRA_HARD';
        tightness?: 'TIGHT' | 'MEDIUM' | 'LOOSE';
        smell?: 'HIGH' | 'MEDIUM' | 'LOW';
        oiliness?: 'HIGH' | 'MEDIUM' | 'LOW';
        tagIds?: string[];
      };

      // 只发送已修改的字段
      const defaultValues = form.formState.defaultValues
      const changedFields = Object.keys(values).filter(key => {
        const typedKey = key as keyof typeof values
        return defaultValues && values[typedKey] !== defaultValues[typedKey]
      })

      // 构建更新数据
      const dataToSend = changedFields.reduce<UpdateData>((acc, key) => {
        const typedKey = key as keyof typeof values
        const value = values[typedKey]

        if (value === undefined) return acc

        // 处理数值字段
        if (['price', 'height', 'width', 'length', 'channelLength', 'totalLength', 'weight'].includes(key)) {
        }
        // 处理布尔值
        else if (key === 'isReversible') {
          acc.isReversible = value as boolean
        }
        // 处理其他字段
        else {
          acc[typedKey as keyof UpdateData] = value as any
        }

        return acc
      }, {})

      const response = await fetch(`/api/products/${productData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '更新失败')
      }

      toast({
        title: '更新成功',
        description: '产品信息已更新'
      })

      router.refresh()
      router.push('/admin/products')

    } catch (error) {
      toast({
        variant: 'destructive',
        title: '更新失败',
        description: error instanceof Error ? error.message : '请稍后重试'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 基本信息 */}
          <Card>
            <CardContent className="pt-6">
              <div className="font-medium mb-4">基本信息</div>
              <div className="space-y-4">
                {/* 产品名称 */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>产品名称</FormLabel>
                      <FormControl>
                        <Input placeholder="输入产品名称" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* URL标识 */}
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL标识</FormLabel>
                      <FormControl>
                        <Input placeholder="输入URL标识" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 产品价格 */}
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
                          placeholder="输入价格"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 产品描述 */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>描述</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="输入产品描述"
                          className="resize-none"
                          {...field}
                        />
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
                    <FormItem>
                      <FormLabel>淘宝链接</FormLabel>
                      <FormControl>
                        <Input placeholder="输入淘宝链接" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* 规格参数 */}
          <Card>
            <CardContent className="pt-6">
              <div className="font-medium mb-4">规格参数</div>
              <div className="space-y-4">
                {/* 注册日期 */}
                <FormField
                  control={form.control}
                  name="registrationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>注册日期</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 尺寸相关字段 */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>高度(mm)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="输入高度" {...field} />
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
                        <FormLabel>宽度(mm)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="输入宽度" {...field} />
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
                        <FormLabel>长度(mm)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="输入长度" {...field} />
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
                        <FormLabel>通道长度(mm)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="输入通道长度" {...field} />
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
                        <FormLabel>总长度(mm)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="输入总长度" {...field} />
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
                        <FormLabel>重量(g)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="输入重量" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 版本和可翻洗 */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>版本</FormLabel>
                        <FormControl>
                          <Input placeholder="输入版本" {...field} />
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
                        <FormLabel>是否可翻洗</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择是否可翻洗" />
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 产品特性 */}
          <Card>
            <CardContent className="pt-6">
              <div className="font-medium mb-4">产品特性</div>
              <div className="space-y-4">
                {/* 刺激度 */}
                <FormField
                  control={form.control}
                  name="stimulation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>刺激度</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择刺激度" />
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择软硬度" />
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择紧致度" />
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

                {/* 气味度 */}
                <FormField
                  control={form.control}
                  name="smell"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>气味度</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择气味度" />
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

                {/* 出油量 */}
                <FormField
                  control={form.control}
                  name="oiliness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>出油量</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择出油量" />
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
              </div>
            </CardContent>
          </Card>

          {/* 关联信息 */}
          <Card>
            <CardContent className="pt-6">
              <div className="font-medium mb-4">关联信息</div>
              <div className="space-y-4">
                {/* 品牌 */}
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
                          {brands.map(brand => (
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

                {/* 产品类型 */}
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
                          {productTypes.map(type => (
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
                          {channelTypes.map(type => (
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

                {/* 材料类型 */}
                <FormField
                  control={form.control}
                  name="materialTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>材料类型</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择材料类型" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {materialTypes.map(type => (
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

                {/* 用途类型 */}
                <FormField
                  control={form.control}
                  name="utilityTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>用途类型</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择用途类型" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {utilityTypes.map(type => (
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

                {/* 标签 */}
                <FormField
                  control={form.control}
                  name="tagIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>标签</FormLabel>
                      <MultiSelect
                        value={field.value || []}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <MultiSelectTrigger>
                            <MultiSelectValue>
                              {(field.value || []).length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {(field.value || []).map((id) => {
                                    const tag = tags.find((t) => t.id === id)
                                    return tag ? (
                                      <Badge 
                                        key={id}
                                        variant="secondary"
                                        className="mr-1"
                                      >
                                        {tag.name}
                                      </Badge>
                                    ) : null
                                  })}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">
                                  选择标签
                                </span>
                              )}
                            </MultiSelectValue>
                          </MultiSelectTrigger>
                        </FormControl>
                        <MultiSelectContent>
                          {tags.map((tag) => (
                            <MultiSelectItem 
                              key={tag.id} 
                              value={tag.id}
                            >
                              {tag.name}
                            </MultiSelectItem>
                          ))}
                        </MultiSelectContent>
                      </MultiSelect>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            保存修改
          </Button>
        </div>
      </form>
    </Form>
  )
} 