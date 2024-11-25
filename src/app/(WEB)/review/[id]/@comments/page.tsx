import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { CommentForm } from "@/components/comments/comment-form"
import { auth } from "@/lib/auth"

async function getComments(reviewId: string) {
  return await prisma.comment.findMany({
    where: { 
      reviewId,
      status: 'APPROVED'
    },
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
    }
  })
}

export default async function Comments({ params }: { params: { id: string } }) {
  const session = await auth()
  const comments = await getComments(params.id)

  return (
    <Card>
      <CardHeader>
        <CardTitle>评论 ({comments.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 评论列表 */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.user.image || undefined} />
                <AvatarFallback>
                  {comment.user.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{comment.user.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(comment.createdAt, {
                      locale: zhCN,
                      addSuffix: true
                    })}
                  </div>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            </div>
          ))}

          {comments.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              暂无评论
            </div>
          )}
        </div>

        {/* 评论表单 */}
        {session ? (
          <CommentForm reviewId={params.id} />
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            请登录后发表评论
          </div>
        )}
      </CardContent>
    </Card>
  )
}