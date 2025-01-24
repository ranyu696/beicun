import { getReviewBySlug } from "@/app/actions/reviews"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface Props {
  params: Promise<{
    slug: string
  }>
}

export default async function ReviewPage(props: Props) {
  const params = await props.params
  const review = await getReviewBySlug(params.slug)
  
  if (!review) return null

  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader className="space-y-6">
        {/* 标题和作者信息 */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                {formatDistanceToNow(new Date(review.publishedAt || review.createdAt), {
                  locale: zhCN,
                  addSuffix: true
                })}
              </span>
            </div>
            <h1 className="text-3xl font-bold leading-tight">{review.title}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={review.author?.avatar} />
              <AvatarFallback>{review.author?.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{review.author?.name}</div>
              <div className="text-sm text-muted-foreground">专业测评人</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="prose prose-lg max-w-none space-y-8">
        {/* 测评内容 */}
        <section className="space-y-4">
          <div 
            className="leading-relaxed prose max-w-none"
            dangerouslySetInnerHTML={{ __html: review.content }}
          />
        </section>

        <Separator className="my-8" />

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
      </CardContent>
    </Card>
  )
}