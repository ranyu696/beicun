'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Wand2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useRouter } from 'next/navigation'
import { pinyin } from 'pinyin-pro'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { MultiSelect, MultiSelectValue, MultiSelectTrigger, MultiSelectContent, MultiSelectItem } from '@/components/ui/multi-select'
import { Badge } from '@/components/ui/badge'


// 表单验证Schema
const productSchema = z.object({
  // 基本信息
  name: z.string().min(1, '请输入产品名称'),
  slug: z.string().min(1, '请输入URL标识'),
  price: z.number().min(0, '价格不能小于0'),
  brandId: z.string().min(1, '请选择品牌'),
  productTypeId: z.string().min(1, '请选择产品类型'),
  channelTypeId: z.string().min(1, '请选择通道类型'),
  materialTypeId: z.string().min(1, '请选择材料类型'),
  utilityTypeId: z.string().min(1, '请选择器具类型'),
  description: z.string().optional(),
  taobaoUrl: z.string().optional(),
  
  // 规格参数
  registrationDate: z.date(),
  height: z.number().min(0),
  width: z.number().min(0),
  length: z.number().min(0),
  channelLength: z.number().min(0),
  totalLength: z.number().min(0),
  weight: z.number().min(0),
  version: z.string(),
  isReversible: z.boolean(),
  
  // 产品特性
  stimulation: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  softness: z.enum(['ULTRA_SOFT', 'SOFT', 'MEDIUM', 'HARD', 'ULTRA_HARD']),
  tightness: z.enum(['TIGHT', 'MEDIUM', 'LOOSE']),
  smell: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  oiliness: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  durability: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  
  // 标签
  tags: z.array(z.string()).default([])
})

type ProductFormValues = z.infer<typeof productSchema>

interface FormData {
  brands: {
    id: string
    name: string
  }[]
  productTypes: {
    id: string
    name: string
  }[]
  channelTypes: {
    id: string
    name: string
  }[]
  materialTypes: {
    id: string
    name: string
  }[]
  utilityTypes: {
    id: string
    name: string
  }[]
  tags: {
    id: string
    name: string
  }[]
}


// 定义步骤
const STEPS = [
  { id: 'basic', title: '基本信息' },
  { id: 'specs', title: '规格参数' },
  { id: 'features', title: '产品特性' },
] as const


export function ProductNewForm({ formData }: { formData: FormData }) {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      price: 0,
      brandId: '',
      productTypeId: '',
      utilityTypeId: '',
      channelTypeId: '',
      materialTypeId: '',
      description: '',
      taobaoUrl: '',
      registrationDate: new Date(),
      height: 0,
      width: 0,
      length: 0,
      channelLength: 0,
      totalLength: 0,
      weight: 0,
      version: '',
      isReversible: false,
      stimulation: 'MEDIUM',
      softness: 'MEDIUM',
      tightness: 'MEDIUM',
      smell: 'MEDIUM',
      oiliness: 'MEDIUM',
      durability: 'MEDIUM',
      tags: []
    }
  })

  // 添加步骤验证函数
  const validateStep = async (currentStep: number): Promise<boolean> => {
    let fieldsToValidate: (keyof ProductFormValues)[] = []

    // 根据当前步骤确定需要验证的字段
    switch (currentStep) {
      case 0: // 基本信息
        fieldsToValidate = [
          'name', 'slug', 'price', 'brandId', 
          'productTypeId', 'channelTypeId', 'materialTypeId',
          'utilityTypeId', 'tags'
        ]
        break
      case 1: // 规格参数
        fieldsToValidate = [
          'registrationDate', 'height', 'width', 'length',
          'channelLength', 'totalLength', 'weight',
          'version'
        ]
        break
      case 2: // 产品特性
        fieldsToValidate = [
          'stimulation', 'softness', 'tightness',
          'smell', 'oiliness', 'durability'
        ]
        break
    }

    const result = await form.trigger(fieldsToValidate)
    return result
  }

  // 修改步骤导航函数
  const nextStep = async () => {
    const isValid = await validateStep(step)
    if (!isValid) {
      toast({
        title: "验证失败",
        description: "请检查并填写必填项",
        variant: "destructive"
      })
      return
    }

    if (step < STEPS.length - 1) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  // 修改表单提交函数
  async function onSubmit(data: ProductFormValues) {
    if (step < STEPS.length - 1) {
      await nextStep()
      return
    }

    try {
      setLoading(true)
      
      // 创建产品基本信息
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          registrationDate: data.registrationDate.toISOString()
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '创建产品失败')
      }

      const { data: product } = await response.json()

      toast({
        title: "创建成功",
        description: "产品基本信息已保存"
      })

      // 跳转到产品列表页
      router.push(`/admin/products`)
    } catch (error) {
      console.error('保存失败:', error)
      toast({
        variant: 'destructive',
        title: '保存失败',
        description: error instanceof Error ? error.message : '请稍后重试'
      })
    } finally {
      setLoading(false)
    }
  }

  // 添加生成 slug 的函数
  const generateSlug = (name: string) => {
    // 转换为拼音，不带声调
    const pinyinStr = pinyin(name, {
      toneType: 'none',
      type: 'string',
      nonZh: 'consecutive' // 保留非中文字符
    })

    // 转小写并规范
    return pinyinStr
      .toLowerCase()
      .replace(/\s+/g, '-') // 将空格替换为连字符
      .replace(/[^a-z0-9-]/g, '') // 只保留字母、数字和连字符
      .replace(/-+/g, '-') // 将多个连字符替换为单个
      .replace(/^-+|-+$/g, '') // 移除首尾连字符
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* 步骤指示器 */}
      <div className="mb-8">
        <div className="flex justify-between">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                "flex flex-col items-center gap-2",
                "relative w-full"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center",
                  "text-sm font-medium cursor-pointer transition-colors",
                  i <= step 
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted bg-background text-muted-foreground",
                  i < step && "hover:bg-primary/90"
                )}
                onClick={async () => {
                  if (i < step) {
                    setStep(i)
                  } else if (i > step) {
                    // 验证当前步骤后才能跳转到后面的步骤
                    const isValid = await validateStep(step)
                    if (isValid) {
                      setStep(i)
                    } else {
                      toast({
                        title: "验证失败",
                        description: "请先完成当前步骤",
                        variant: "destructive"
                      })
                    }
                  }
                }}
              >
                {i + 1}
              </div>
              <div className={cn(
                "text-sm font-medium",
                i <= step ? "text-primary" : "text-muted-foreground"
              )}>
                {s.title}
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  "absolute top-5 left-1/2 w-full h-[2px]",
                  i < step ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form className="space-y-8">
              {/* 基本信息步骤 */}
              {step === 0 && (
                <div className="space-y-6">
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
                        <FormLabel>URL标识</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input {...field} />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                const name = form.getValues('name')
                                if (!name) {
                                  toast({
                                    variant: "destructive",
                                    title: "生成失败",
                                    description: "先输入产品名称"
                                  })
                                  return
                                }
                                const slug = pinyin(name, { toneType: 'none' })
                                  .replace(/\s+/g, '-')
                                  .toLowerCase()
                                  .replace(/[^a-z0-9-]/g, '')
                                  .replace(/-+/g, '-')
                                  .replace(/^-+|-+$/g, '')
                                field.onChange(slug)
                              }}
                            >
                              <Wand2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          用于URL的唯一标识，只能包含小写字母、数字和连字符
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="brandId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>品牌</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="选择品牌" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {formData.brands.map(brand => (
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

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>价格</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="productTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>产品类型</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="选择产品类型" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {formData.productTypes.map(type => (
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

                    <FormField
                      control={form.control}
                      name="utilityTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>器具类型</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="选择器具类型" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {formData.utilityTypes.map(type => (
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="channelTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>通道类型</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="选择通道类型" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {formData.channelTypes.map(type => (
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

                    <FormField
                      control={form.control}
                      name="materialTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>材料类型</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="选择材料类型" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {formData.materialTypes.map(type => (
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
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="tags"
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
                                        const tag = formData.tags.find((t) => t.id === id)
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
                              {formData.tags.map((tag) => (
                                <MultiSelectItem 
                                  key={tag.id} 
                                  value={tag.id}
                                >
                                  {tag.name}
                                </MultiSelectItem>
                              ))}
                            </MultiSelectContent>
                          </MultiSelect>
                          <FormDescription>
                            可以选择多个标签
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>产品描述</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="输入产品描述..."
                            className="h-32"
                          />
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
                          <Input {...field} placeholder="https://item.taobao.com/..." />
                        </FormControl>
                        <FormDescription>
                          可选，关联���淘宝商品链接
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* 规格参数步骤 */}
              {step === 1 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="registrationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>登记日期</FormLabel>
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>高度 (mm)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value))}
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
                          <FormLabel>宽度 (mm)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="length"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>长度 (mm)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value))}
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
                          <FormLabel>通道长度 (mm)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value))}
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
                          <FormLabel>总长度 (mm)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>重量 (g)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value))}
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
                  </div>

                  <FormField
                    control={form.control}
                    name="isReversible"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            可翻转
                          </FormLabel>
                          <FormDescription>
                            产品是否���持翻转使用
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* 产品特性步骤 */}
              {step === 2 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="stimulation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>刺激度</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                  <FormField
                    control={form.control}
                    name="softness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>软硬度</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                  <FormField
                    control={form.control}
                    name="tightness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>紧实度</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择紧实度" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LOOSE">松</SelectItem>
                            <SelectItem value="MEDIUM">中</SelectItem>
                            <SelectItem value="TIGHT">紧</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="smell"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>气味</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="选择气味等级" />
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

                    <FormField
                      control={form.control}
                      name="oiliness"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>油性</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="选择油性等级" />
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

                    <FormField
                      control={form.control}
                      name="durability"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>耐用度</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="选择耐用度" />
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
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* 导航按钮 */}
      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={step === 0 || loading}
        >
          上一步
        </Button>
        <Button 
          type="button"  // 改为 type="button"
          disabled={loading}
          onClick={step === STEPS.length - 1 
            ? form.handleSubmit(onSubmit)
            : nextStep
          }
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {step === STEPS.length - 1 ? '保存' : '下一步'}
        </Button>
      </div>
    </div>
  )
}