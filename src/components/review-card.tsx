import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Star } from "lucide-react"
import Link from "next/link"
import { AvatarFallback, AvatarImage, Avatar } from "@/components/ui/avatar"
import { CardTitle, CardDescription } from "@/components/ui/card"
import { formatShortDate } from "@/lib/utils"

interface ReviewProps {
  review: {
    id: string
    title: string
    unboxing: string
    createdAt: Date
    product: {
      id: string
      name: string
      brand: {
        name: string
      }
    }
    author: {
      name: string | null
      image: string | null
    }
  }
}

export function ReviewCard({ review }: ReviewProps) {
  return (
    <Link href={`/reviews/${review.id}`}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar>
            <AvatarImage src={review.author.image || ''} />
            <AvatarFallback>{review.author.name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{review.author.name}</CardTitle>
            <CardDescription>{formatShortDate(review.createdAt)}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>{review.product.brand.name}</span>
            <span>·</span>
            <span>{review.product.name}</span>
          </div>
          <h3 className="font-medium mb-2 line-clamp-1">{review.title}</h3>
          <div 
            className="text-gray-600 line-clamp-3 prose"
            dangerouslySetInnerHTML={{ 
              __html: review.unboxing 
            }}
          />
        </CardContent>
      </Card>
    </Link>
  )
} 