import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import Image from "next/image"
import { Star, ThumbsUp, ThumbsDown } from "lucide-react"
import { cn } from "@/lib/utils"

async function getReview(id: string) {
  return await prisma.review.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          name: true,
          image: true
        }
      },
      product: {
        select: {
          name: true,
          slug: true,
          mainImage: true,
          averageRating: true
        }
      }
    }
  })
}

export default async function ReviewPage({ params }: { params: { id: string } }) {
  const review = await getReview(params.id)
  
  if (!review) return null

  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader className="space-y-6">
        {/* 标题和作者信息 */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">
                {review.product.name}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                {formatDistanceToNow(review.publishedAt || review.createdAt, {
                  locale: zhCN,
                  addSuffix: true
                })}
              </span>
            </div>
            <h1 className="text-3xl font-bold leading-tight">{review.title}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={review.author.image || undefined} />
              <AvatarFallback>{review.author.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{review.author.name}</div>
              <div className="text-sm text-muted-foreground">专业测评人</div>
            </div>
          </div>
        </div>

        {/* 产品评分 */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-4xl font-bold text-primary">
            {review.product.averageRating?.toFixed(1)}
          </div>
          <div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-5 w-5",
                    i < Math.floor(review.product.averageRating || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              综合评分
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="prose prose-lg max-w-none space-y-8">
        {/* 开箱体验 */}
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <span className="w-1 h-8 bg-primary rounded-full"></span>
            开箱体验
          </h2>
          <p className="text-lg leading-relaxed">{review.unboxing}</p>
          {review.unboxingImages?.length > 0 && (
            <div className="grid grid-cols-2 gap-4 not-prose mt-6">
              {review.unboxingImages.map((image, index) => (
                <div key={index} className="relative aspect-video rounded-xl overflow-hidden">
                  <Image
                    src={image}
                    alt={`开箱图片 ${index + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 使用感受 */}
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <span className="w-1 h-8 bg-primary rounded-full"></span>
            使用感受
          </h2>
          <p className="text-lg leading-relaxed">{review.experience}</p>
        </section>

        {/* 清洁与维护 */}
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <span className="w-1 h-8 bg-primary rounded-full"></span>
            清洁与维护
          </h2>
          <p className="text-lg leading-relaxed">{review.maintenance}</p>
        </section>

        {/* 优缺点 */}
        <section className="not-prose grid grid-cols-2 gap-6">
          <div className="space-y-4 p-6 bg-green-50 rounded-xl">
            <h3 className="flex items-center gap-2 text-xl font-semibold text-green-700">
              <ThumbsUp className="w-5 h-5" />
              优点
            </h3>
            <ul className="space-y-2">
              {review.pros?.map((pro, index) => (
                <li key={index} className="flex items-start gap-2 text-green-700">
                  <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4 p-6 bg-red-50 rounded-xl">
            <h3 className="flex items-center gap-2 text-xl font-semibold text-red-700">
              <ThumbsDown className="w-5 h-5" />
              缺点
            </h3>
            <ul className="space-y-2">
              {review.cons?.map((con, index) => (
                <li key={index} className="flex items-start gap-2 text-red-700">
                  <span className="mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 总结 */}
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <span className="w-1 h-8 bg-primary rounded-full"></span>
            总结
          </h2>
          <div className="p-6 bg-muted rounded-xl">
            <p className="text-lg leading-relaxed">{review.conclusion}</p>
          </div>
        </section>
      </CardContent>
    </Card>
  )
}