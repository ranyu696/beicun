import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { reviewApi } from '@/services/review'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ReviewStatus } from '@/types/review'

export default function ReviewDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  // 获取评论详情
  const { data: reviewData, isLoading } = useQuery({
    queryKey: ['review', id],
    queryFn: async () => {
      console.log('Fetching review with id:', id)
      const response = await reviewApi.getReview(id!)
      console.log('API Response:', response)
      return response
    },
    enabled: !!id,
    select: (response) => {
      console.log('Processing response:', response)
      return response.data
    },
  })

  // 更新评测状态
  const { mutate: updateStatus } = useMutation({
    mutationFn: async (status: ReviewStatus) => {
      const response = await reviewApi.updateReview(id!, { status })
      return response.data
    },
    onSuccess: () => {
      toast({
        title: '更新成功',
      })
      navigate('/review/list')
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!reviewData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>评测不存在</p>
      </div>
    )
  }

  console.log('Rendering with data:', reviewData)

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return ''
    try {
      // 将日期字符串转换为 ISO 格式
      const isoDate = dateString.replace(' ', 'T')
      return format(parseISO(isoDate), 'yyyy-MM-dd HH:mm:ss')
    } catch (error) {
      console.error('日期格式化错误:', error)
      return dateString // 如果格式化失败，返回原始字符串
    }
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
          <h2 className="text-2xl font-semibold tracking-tight">评测详情</h2>
          <p className="text-sm text-muted-foreground">
            查看和管理评测内容
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{reviewData.title}</CardTitle>
              <CardDescription>
                {reviewData.author?.name} · {formatDate(reviewData.createdAt)}
              </CardDescription>
            </div>
            <Badge
              variant={
                reviewData.status === 'PUBLISHED'
                  ? 'default'
                  : reviewData.status === 'PENDING'
                  ? 'secondary'
                  : 'destructive'
              }
            >
              {reviewData.status === 'PUBLISHED'
                ? '已发布'
                : reviewData.status === 'PENDING'
                ? '已下架'
                : '草稿'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">商品信息</h3>
            <div className="flex items-center gap-4">
              {reviewData.product?.mainImage?.[0]?.url && (
                <img
                  src={reviewData.product.mainImage[0].url}
                  alt={reviewData.product.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div>
                <p className="font-medium">{reviewData.product?.name}</p>
                <p className="text-sm text-muted-foreground">
                  浏览量：{reviewData.views}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">评测内容</h3>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: reviewData.content }}
            />
          </div>

          {reviewData.pros && reviewData.pros.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">优点</h3>
              <ul className="list-disc pl-5 space-y-1">
                {reviewData.pros.map((pro, index) => (
                  <li key={index}>{pro}</li>
                ))}
              </ul>
            </div>
          )}

          {reviewData.cons && reviewData.cons.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">缺点</h3>
              <ul className="list-disc pl-5 space-y-1">
                {reviewData.cons.map((con, index) => (
                  <li key={index}>{con}</li>
                ))}
              </ul>
            </div>
          )}

          {reviewData.conclusion && (
            <div>
              <h3 className="text-lg font-semibold mb-2">结论</h3>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: reviewData.conclusion }}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          {reviewData.status === 'ARCHIVED' && (
            <div className="flex justify-end space-x-4">
              <Button onClick={() => updateStatus('PUBLISHED')}>发布</Button>
            </div>
          )}
          {reviewData.status === 'PUBLISHED' && (
            <div className="flex justify-end space-x-4">
              <Button
                variant="destructive"
                onClick={() => updateStatus('PENDING')}
              >
                下架
              </Button>
            </div>
          )}
          {reviewData.status === 'PENDING' && (
            <div className="flex justify-end space-x-4">
              <Button onClick={() => updateStatus('PUBLISHED')}>重新发布</Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
