import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Star } from "lucide-react"
import Link from "next/link"
import { AvatarFallback, AvatarImage, Avatar } from "@/components/ui/avatar"
import { CardTitle, CardDescription } from "@/components/ui/card"
import { Review } from "@/types/review"

interface ReviewProps {
  review: Review
}

export function ReviewCard({ review }: ReviewProps) {
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  return (
    <Link href={`/reviews/${review.slug}`}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar>
            <AvatarImage src={review.author?.avatar || ''} />
            <AvatarFallback>{review.author?.name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{review.author?.name || '匿名用户'}</CardTitle>
            <CardDescription>{formatDate(review.createdAt)}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>{review.product?.brand?.name}</span>
            <span>·</span>
            <span>{review.product?.name}</span>
          </div>
          <h3 className="font-medium mb-2 line-clamp-1">{review.title}</h3>
          <div 
            className="text-gray-600 line-clamp-3 prose"
            dangerouslySetInnerHTML={{ 
              __html: review.content || ''
            }}
          />
        </CardContent>
      </Card>
    </Link>
  )
}