import { getReviews } from "@/app/actions/reviews"
import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Star, MessageSquare, Eye } from "lucide-react"
import { cn, getImageUrl } from "@/lib/utils"
import { ReviewStatus } from "@/types/review"
import { Suspense } from "react"

interface Props {
  searchParams: Promise<{
    page?: string
  }>
}

export default async function ReviewsPage(props: Props) {
  // 等待 searchParams 解析完成
  const searchParams = await props.searchParams
  const page = Number(searchParams.page) || 1
  const pageSize = 10

  const { reviews, total } = await getReviews({
    page,
    pageSize,
    status: ReviewStatus.PUBLISHED
  })

  // 计算总页数
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 头部区域 */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">产品测评</h1>
          <p className="text-muted-foreground">
            深度体验，专业评测，助你做出明智选择
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          共 {total} 篇测评
        </div>
      </div>

      {/* 测评列表 */}
      <div className="grid gap-6">
        {reviews.map((review) => (
          <Link key={review.id} href={`/reviews/${review.slug}`}>
            <Card className="group p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex gap-6">
                {/* 产品图片 */}
                <div className="relative w-48 aspect-[4/3] rounded-lg overflow-hidden">
                  <Image
                    src={getImageUrl(review.cover)}
                    alt={review.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* 评分标签 */}
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded-full">
                    <div className="flex items-center gap-1 text-white">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {review.product?.averageRating?.toFixed(1) || '暂无评分'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 测评内容 */}
                <div className="flex-1 flex flex-col">
                  {/* 标题和产品信息 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                        {review.product?.name}
                      </span>
                      <span>•</span>
                      <span>{review.product?.materialType?.name || '综合测评'}</span>
                    </div>
                    <h2 className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {review.title}
                    </h2>
                    <div 
                      className="mt-2 text-sm text-muted-foreground line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: review.conclusion }}
                    />
                  </div>

                  {/* 底部信息 */}
                  <div className="mt-4 flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={review.author?.avatar} />
                        <AvatarFallback>
                          {review.author?.name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{review.author?.name}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">
                        {formatDistanceToNow(new Date(review.publishedAt || review.createdAt), {
                          locale: zhCN,
                          addSuffix: true
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{review.views || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{review.comments?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}

        {reviews.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            暂无测评内容
          </div>
        )}
      </div>
      <Suspense fallback={<div className="h-14" />}>
      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Link
            href={`/reviews?page=${Math.max(1, page - 1)}`}
            className={cn(
              "px-4 py-2 rounded-md text-sm",
              page === 1 ? "pointer-events-none opacity-50" : "hover:bg-muted"
            )}
          >
            上一页
          </Link>
          {Array.from({ length: totalPages }).map((_, i) => (
            <Link
              key={i}
              href={`/reviews?page=${i + 1}`}
              className={cn(
                "px-4 py-2 rounded-md text-sm",
                page === i + 1
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              {i + 1}
            </Link>
          ))}
          <Link
            href={`/reviews?page=${Math.min(totalPages, page + 1)}`}
            className={cn(
              "px-4 py-2 rounded-md text-sm",
              page === totalPages ? "pointer-events-none opacity-50" : "hover:bg-muted"
            )}
          >
            下一页
          </Link>
        </div>
      )}
      </Suspense>
    </div>
  )
}