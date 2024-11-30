import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

type Params = Promise<{ slug: string }>
export default async function ReviewsPage({ params }: { params: Params }) {
  const {slug }= await params

  const reviews = await prisma.review.findMany({
    where: {
      product: {
        slug: slug
      },
      status: 'PUBLISHED'
    },
    include: {
      author: {
        select: {
          name: true,
          image: true
        }
      }
    },
    orderBy: {
      publishedAt: 'desc'
    },
    take: 5
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>最新评测</CardTitle>
        <Link 
          href={`/products/${slug}/reviews`}
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
              <div className="flex items-center gap-3 mb-2">
                <Avatar>
                  <AvatarImage src={review.author.image || undefined} />
                  <AvatarFallback>
                    {review.author.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{review.author.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(review.publishedAt!, {
                      locale: zhCN,
                      addSuffix: true
                    })}
                  </div>
                </div>
                {review.isRecommended && (
                  <Badge variant="secondary">推荐</Badge>
                )}
              </div>
              <h3 className="font-medium mb-1">{review.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {review.conclusion}
              </p>
            </Link>
          ))}

          {reviews.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              暂无评测
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}