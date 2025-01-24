'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { CommentForm } from "@/components/comments/comment-form"
import { getComments } from "@/app/actions/comments"
import { Comment } from "@/types/comment"
import { useAuth } from "@/lib/auth"
import { useEffect, useState } from "react"

interface Props {
  params: {
    slug: string
  }
}

export default function Comments({ params }: Props) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])

  useEffect(() => {
    const fetchComments = async () => {
      const { list } = await getComments({ 
        reviewSlug: params.slug,
        status: 'PUBLISHED'
      })
      setComments(list)
    }

    fetchComments()
  }, [params.slug])

  return (
    <Card>
      <CardHeader>
        <CardTitle>评论 ({comments.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 评论列表 */}
        <div className="space-y-4">
          {comments.map((comment: Comment) => (
            <div key={comment.id} className="flex gap-4">
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.user?.avatar} />
                <AvatarFallback>
                  {comment.user?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{comment.user?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      locale: zhCN,
                      addSuffix: true
                    })}
                  </div>
                </div>
                <p className="text-sm">{comment.content}</p>

                {/* 回复列表 */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 pl-4 space-y-4 border-l-2">
                    {comment.replies.map((reply: Comment) => (
                      <div key={reply.id} className="flex gap-4">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={reply.user?.avatar} />
                          <AvatarFallback>
                            {reply.user?.name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <span className="font-medium">{reply.user?.name}</span>
                              {reply.replyTo && (
                                <span className="text-muted-foreground">
                                  {" "}回复{" "}
                                  <span className="text-foreground">
                                    {reply.replyTo.name}
                                  </span>
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(reply.createdAt), {
                                locale: zhCN,
                                addSuffix: true
                              })}
                            </div>
                          </div>
                          <p className="text-sm">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
        {user ? (
          <CommentForm reviewId={params.slug} onSuccess={() => {
            // 刷新评论列表
            getComments({ 
              reviewSlug: params.slug,
              status: 'PUBLISHED'
            }).then(({ list }) => setComments(list))
          }} />
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            请登录后发表评论
          </div>
        )}
      </CardContent>
    </Card>
  )
}