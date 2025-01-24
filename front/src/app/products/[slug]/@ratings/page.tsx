import { auth } from "@/lib/auth"
import { RatingForm } from "@/components/ratings/rating-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { notFound } from "next/navigation"
import { getProductBySlug } from "@/app/actions/products"

interface RatingsPageProps {
  params: {
    slug: string
  }
}

export default async function RatingsPage({ params }: RatingsPageProps) {
  try {
    const [session, product] = await Promise.all([
      auth(),
      getProductBySlug(params.slug)
    ])

    if (!product) {
      notFound()
    }

    const ratings = product.ratings || []
    const totalRatings = ratings.length
    const averageRating = product.averageRating || 0

    // 计算评分分布
    const distribution = Array.from({ length: 5 }, (_, i) => {
      const score = i + 1
      const count = ratings.filter(r => Math.floor(r.rating) === score).length
      return {
        score,
        count,
        percentage: totalRatings > 0 ? (count / totalRatings) * 100 : 0
      }
    }).reverse()

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>用户评分</CardTitle>
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 fill-primary text-primary" />
            <span className="text-lg font-bold">{averageRating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">
              ({totalRatings} 个评分)
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 评分分布 */}
            <div className="space-y-2">
              {distribution.map(({ score, count, percentage }) => (
                <div key={score} className="flex items-center gap-2">
                  <div className="w-12 text-sm text-muted-foreground">
                    {score} 星
                  </div>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-12 text-sm text-muted-foreground text-right">
                    {count}
                  </div>
                </div>
              ))}
            </div>

            {/* 评分表单 */}
            {session?.user && (
              <div className="pt-6 border-t">
                <RatingForm 
                  productId={product.id}
                  userId={session.user.id}
                />
              </div>
            )}

            {/* 最新评分列表 */}
            <div className="space-y-4 pt-6 border-t">
              {ratings.slice(0, 5).map((rating) => (
                <div key={rating.id} className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={rating.user?.image || ''} alt={rating.user?.name || ''} />
                    <AvatarFallback>
                      {rating.user?.name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {rating.user?.name}
                        </span>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                'h-4 w-4',
                                i < rating.rating
                                  ? 'fill-primary text-primary'
                                  : 'fill-muted text-muted'
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(rating.createdAt), {
                          addSuffix: true,
                          locale: zhCN
                        })}
                      </span>
                    </div>
                    {rating.comment && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {rating.comment}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {ratings.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">暂无评分</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  } catch (error) {
    console.error('获取产品评分失败:', error)
    notFound()
  }
}