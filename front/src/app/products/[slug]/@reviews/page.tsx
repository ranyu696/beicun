import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { notFound } from "next/navigation"
import { getProductBySlug } from "@/app/actions/products"

interface ReviewsPageProps {
  params: {
    slug: string
  }
}

export default async function ReviewsPage({ params }: ReviewsPageProps) {
  try {
    const product = await getProductBySlug(params.slug)

    if (!product) {
      notFound()
    }

    const reviews = product.reviews?.filter(review => review.status === 'PUBLISHED') || []

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>最新评测</CardTitle>
          <Link 
            href={`/products/${params.slug}/reviews`}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            查看全部
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviews.map((review) => (
              <Link
                key={review.id}
                href={`/reviews/${review.id}`}
                className="block p-4 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.author?.avatar || ''} alt={review.author?.name || ''} />
                    <AvatarFallback>
                      {review.author?.name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium leading-none">
                        {review.author?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(review.publishedAt || review.createdAt), {
                          addSuffix: true,
                          locale: zhCN
                        })}
                      </p>
                    </div>
                    <h4 className="text-base font-semibold leading-none mt-2">
                      {review.title}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {review.content}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            {reviews.length === 0 && (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">暂无评测</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  } catch (error) {
    console.error('获取产品评测失败:', error)
    notFound()
  }
}