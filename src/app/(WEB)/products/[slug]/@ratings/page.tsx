import { auth } from "@/lib/auth"
import { RatingForm } from "@/components/ratings/rating-form"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { cn } from "@/lib/utils"

async function getProductRatings(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true,
      averageRating: true,
      ratings: {
        include: {
          user: {
            select: {
              name: true,
              image: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      },
      _count: {
        select: {
          ratings: true
        }
      }
    }
  })

  if (!product) return null

  // 计算评分分布
  const distribution = Array.from({ length: 5 }, (_, i) => {
    const score = i + 1
    const count = product.ratings.filter(r => Math.floor(r.rating) === score).length
    return {
      score,
      count,
      percentage: product._count.ratings > 0 
        ? (count / product._count.ratings) * 100 
        : 0
    }
  }).reverse()

  return {
    productId: product.id,
    ratings: product.ratings,
    distribution,
    totalCount: product._count.ratings,
    averageRating: product.averageRating
  }
}


type Params = Promise<{ slug: string }>

export default async function RatingsPage({ params }: { params: Params }) {
  const {slug }= await params
  const session = await auth()
  const data = await getProductRatings(slug)
  
  if (!data) return null

  return (
    <div className="space-y-6">
      {/* 评分统计卡片 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>用户评分</CardTitle>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{data.averageRating.toFixed(1)}</div>
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.floor(data.averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                ({data.totalCount}个评分)
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 评分分布 */}
            <div className="space-y-2">
              {data.distribution.map((item) => (
                <div key={item.score} className="flex items-center gap-2">
                  <div className="w-12 text-sm">{item.score} 星</div>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="w-16 text-sm text-right">
                    {item.count} ({Math.round(item.percentage)}%)
                  </div>
                </div>
              ))}
            </div>

            {/* 最新评分列表 */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">最新评分</h3>
              {data.ratings.map((rating) => (
                <div key={rating.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={rating.user.image || undefined} />
                    <AvatarFallback>
                      {rating.user.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{rating.user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDistanceToNow(rating.createdAt, {
                          locale: zhCN,
                          addSuffix: true
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < rating.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                    {rating.reason && (
                      <p className="text-sm mt-2">{rating.reason}</p>
                    )}
                  </div>
                </div>
              ))}

              {data.ratings.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  暂无评分
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 评分表单 - 传递实际的产品ID而不是slug */}
      {session ? (
        <RatingForm productId={data.productId} />
      ) : (
        <Card>
          <CardContent className="py-6">
            <div className="text-center text-muted-foreground">
              请登录后进行评分
            </div>
          </CardContent>
        </Card>
      )}

      {/* 评分列表 */}
      <Card>
        {/* ... 原有的评分列表内容 ... */}
      </Card>
    </div>
  )
}