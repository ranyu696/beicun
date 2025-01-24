'use client'

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
import { Rating } from "@/types/rating"
import { use } from "react"
import type { Product } from "@/types/product"

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default function RatingsPage(props: PageProps) {
  const params = use(props.params)
  const { slug } = params

  const [session, product] = use(
    Promise.all([
      auth(),
      getProductBySlug(slug)
    ])
  )

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
        {session?.user && (
          <div className="mb-8">
            <RatingForm 
              productId={product.id} 
              currentUser={session.user}
            />
          </div>
        )}

        <div className="space-y-6">
          {ratings.map((rating: Rating) => (
            <div key={rating.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={rating.user?.avatar} />
                  <AvatarFallback>{rating.user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {rating.user?.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(rating.createdAt), {
                        addSuffix: true,
                        locale: zhCN
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < rating.rating
                              ? "fill-primary text-primary"
                              : "fill-muted stroke-muted-foreground/20"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">
                      {rating.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
              {rating.reason && (
                <p className="text-sm text-muted-foreground pl-10">
                  {rating.reason}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}