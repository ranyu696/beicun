import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { reviewApi } from '@/services/review'
import { productApi } from '@/services/product'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import FilePickerDialog from '@/components/common/FilePickerDialog'
import { Product } from '@/types/product'
import { CreateReviewRequest } from '@/types/review'
import { useState, useCallback } from 'react'
import { MinimalTiptapEditor } from '@/components/minimal-tiptap'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { Content } from '@tiptap/react'

interface FormData extends Omit<CreateReviewRequest, 'productId'> {
  productId: string | null
}

const initialFormData: FormData = {
  title: '',
  productId: null,
  content: '',
  pros: [''],
  cons: [''],
  conclusion: '',
  cover: '',
}

interface ApiError {
  message: string
}

export default function ReviewCreate() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [pickerType, setPickerType] = useState<{
    type: 'editor' | 'cover',
    resolve?: (url: string) => void
  } | null>(null)

  const onContentChange = useCallback((value: Content) => {
    setFormData(prev => ({ ...prev, content: value ? String(value) : '' }))
  }, [])

  const onConclusionChange = useCallback((value: Content) => {
    setFormData(prev => ({ ...prev, conclusion: value ? String(value) : '' }))
  }, [])

  // 获取商品列表
  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await productApi.getProducts({
        page: 1,
        pageSize: 100,
      })
      return response
    },
  })

  const products = productsData?.data?.list || []

  // 创建评测
  const { mutate: createReview } = useMutation({
    mutationFn: async (data: CreateReviewRequest) => {
      const response = await reviewApi.createReview(data)
      return response
    },
    onSuccess: (response) => {
      if (!response?.data?.id) {
        toast({
          title: '创建失败',
          description: '返回数据格式错误',
          variant: 'destructive',
        })
        return
      }
      toast({
        title: '创建成功',
        description: '评测已创建成功',
      })
      navigate(`/review/detail/${response.data.id}`)
    },
    onError: (error: ApiError) => {
      toast({
        title: '创建失败',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  // 处理表单提交
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      
      if (!formData.cover) {
        toast({
          variant: "destructive",
          title: "错误",
          description: "请选择封面图片",
        })
        return
      }

      if (!formData.productId) {
        toast({
          variant: "destructive",
          title: "错误",
          description: "请选择商品",
        })
        return
      }

      const submitData = {
        ...formData,
        productId: Number(formData.productId),
      }

      createReview(submitData)
    },
    [formData, createReview, toast]
  )

  // 处理商品选择
  const handleProductSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value
    setFormData(prev => ({
      ...prev,
      productId: productId || null,
    }))
  }, [])

  // 处理优点/缺点修改
  const handlePointChange = useCallback((
    type: 'pros' | 'cons',
    index: number,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => i === index ? value : item),
    }))
  }, [])

  // 处理添加优点/缺点
  const handleAddPoint = useCallback((type: 'pros' | 'cons') => {
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], ''],
    }))
  }, [])

  // 处理删除优点/缺点
  const handleRemovePoint = useCallback((type: 'pros' | 'cons', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }))
  }, [])

  return (
    <TooltipProvider>
    <div className="container py-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 商品选择 */}
        <div className="space-y-2">
          <Label>商品</Label>
          <select
            value={formData.productId || ''}
            onChange={handleProductSelect}
            className="w-full border rounded-lg p-2"
          >
            <option value="">请选择商品</option>
            {products.map((product: Product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        {/* 标题 */}
        <div className="space-y-2">
          <Label>标题</Label>
          <Input
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="请输入标题"
          />
        </div>

        {/* 正文 */}
        <div className="space-y-2">
          <Label>正文</Label>
          <MinimalTiptapEditor
            value={formData.content}
            onChange={onContentChange}
            className="w-full min-h-[400px]"
            editorContentClassName="p-5"
            output="html"
            placeholder="请输入正文内容..."
            autofocus={true}
            editable={true}
            editorClassName="focus:outline-none"
          />
        </div>

        {/* 优点 */}
        <div className="space-y-2">
          <Label>优点</Label>
          {formData.pros.map((pro, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={pro}
                onChange={e => handlePointChange('pros', index, e.target.value)}
                placeholder="请输入优点"
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleRemovePoint('pros', index)}
                disabled={formData.pros.length === 1}
              >
                删除
              </Button>
            </div>
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
        <div className="space-y-2">
          <Label>缺点</Label>
          {formData.cons.map((con, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={con}
                onChange={e => handlePointChange('cons', index, e.target.value)}
                placeholder="请输入缺点"
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleRemovePoint('cons', index)}
                disabled={formData.cons.length === 1}
              >
                删除
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => handleAddPoint('cons')}
          >
            添加缺点
          </Button>
        </div>

        {/* 结论 */}
        <div className="space-y-2">
          <Label>结论</Label>
          <MinimalTiptapEditor
            value={formData.conclusion}
            onChange={onConclusionChange}
            className="w-full min-h-[200px]"
            editorContentClassName="p-5"
            output="html"
            placeholder="请输入结论..."
            autofocus={true}
            editable={true}
            editorClassName="focus:outline-none"
          />
        </div>

        {/* 封面图片 */}
        <div className="space-y-2">
          <Label>封面图片</Label>
          <div className="flex items-center gap-2">
            <Input value={formData.cover} readOnly placeholder="请选择封面图片" />
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setPickerType({
                  type: 'cover'
                })
                setIsPickerOpen(true)
              }}
            >
              选择图片
            </Button>
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="flex justify-end">
          <Button type="submit" size="lg">
            创建评测
          </Button>
        </div>
      </form>

      {isPickerOpen && (
        <FilePickerDialog
          open={isPickerOpen}
          onOpenChange={setIsPickerOpen}
          accept="image"
          title="选择图片"
          onSelect={(url) => {
            if (pickerType?.type === 'cover') {
              setFormData(prev => ({ ...prev, cover: url }))
            }
            setIsPickerOpen(false)
            setPickerType(null)
          }}
        />
      )}
    </div>
    </TooltipProvider>
  )
}
