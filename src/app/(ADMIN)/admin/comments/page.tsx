import { DataTable } from "@/components/ui/data-table"
import { columns } from "@/components/admin/comments/columns"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "评论管理 - 后台管理",
  description: "管理评论",
}

export default async function CommentsPage() {
  const comments = await prisma.comment.findMany({
    include: {
      user: true,
      review: {
        select: {
          title: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const formattedComments = comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    status: comment.status,
    reviewTitle: comment.review.title,
    userName: comment.user.name || '匿名用户',
    createdAt: format(comment.createdAt, 'yyyy-MM-dd HH:mm:ss'),
  }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">评论管理</h2>
        </div>
        <DataTable columns={columns} data={formattedComments} searchKey="content" />
      </div>
    </div>
  )
}
