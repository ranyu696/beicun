import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { ReviewActions } from "@/components/admin/reviews/ReviewActions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import Image from "next/image"
import { ReviewStatus } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Eye, Calendar, MessageSquare } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"


export const metadata: Metadata = {
  title: "测评详情 - 后台管理",
  description: "查看测评详情",
}
// 定义 Badge variant 的类型
type BadgeVariant = "default" | "secondary" | "destructive" | "outline"

// 定义状态标签的类型
type StatusLabel = {
  label: string
  variant: BadgeVariant
}

// 状态标签配置
const statusLabels: Record<ReviewStatus, StatusLabel> = {
  PENDING: { 
    label: '待审核', 
    variant: 'secondary' 
  },
  PUBLISHED: { 
    label: '已发布', 
    variant: 'default' 
  },
  ARCHIVED: { 
    label: '已归档', 
    variant: 'outline' 
  }
}

type Params = Promise<{ id: string }>

export default async function ReviewPage({ params }: { params: Params }) {
  const { id } = await params

  const review = await prisma.review.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      status: true,
      unboxing: true,
      experience: true,
      maintenance: true,
      pros: true,
      cons: true,
      conclusion: true,
      views: true,
      publishedAt: true,
      createdAt: true,
      isRecommended: true,
      product: {
        select: {
          id: true,
          name: true,
          description: true,
          mainImage: true,
        }
      },
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        }
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  if (!review) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">测评详情</h2>
        <ReviewActions review={review} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{review.title}</CardTitle>
                <Badge variant={statusLabels[review.status].variant}>
                  {statusLabels[review.status].label}
                </Badge>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={review.author.image || undefined} />
                    <AvatarFallback>
                      {review.author.name?.charAt(0) || review.author.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{review.author.name || review.author.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{review.views} 次浏览</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>创建于 {format(new Date(review.createdAt), 'yyyy-MM-dd HH:mm')}</span>
                </div>
                {review.publishedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>发布于 {format(new Date(review.publishedAt), 'yyyy-MM-dd HH:mm')}</span>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="prose max-w-none dark:prose-invert">
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold">开箱体验</h3>
                  <div 
                    className="leading-relaxed prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: review.unboxing }}
                  />
                </section>

                <Separator className="my-8" />

                <section className="space-y-4">
  <h3 className="text-xl font-semibold">使用感受</h3>
                  <div 
                    className="leading-relaxed prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: review.experience }}
                  />
                </section>

                <Separator className="my-8" />

                <section className="space-y-4">
                  <h3 className="text-xl font-semibold">清洁与维护</h3>
                  <div 
                    className="leading-relaxed prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: review.maintenance }}
                  />
                </section>

                <Separator className="my-8" />

                <div className="grid grid-cols-2 gap-8">
                  <section className="space-y-4">
                    <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">优点</h3>
                    <ul className="space-y-2">
                      {review.pros.map((pro, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-600 dark:text-green-400">•</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">缺点</h3>
                    <ul className="space-y-2">
                      {review.cons.map((con, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-600 dark:text-red-400">•</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                <Separator className="my-8" />

                <section className="space-y-4">
  <h3 className="text-xl font-semibold">总结</h3>
  <div 
                    className="leading-relaxed prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: review.conclusion }}
                  />
                </section>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <CardTitle>评论 ({review.comments.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {review.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition"
                    >
                      <Avatar>
                        <AvatarImage src={comment.user.image || undefined} />
                        <AvatarFallback>
                          {comment.user.name?.charAt(0) || comment.user.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">
                            {comment.user.name || comment.user.email}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(comment.createdAt), 'yyyy-MM-dd HH:mm')}
                          </div>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>产品信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src={review.product.mainImage}
                  alt={review.product.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>
              <h4 className="text-lg font-medium">{review.product.name}</h4>
              {review.product.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {review.product.description}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}