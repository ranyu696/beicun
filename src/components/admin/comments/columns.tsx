"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"
import { Badge } from "@/components/ui/badge"

export type CommentColumn = {
  id: string
  content: string
  status: string
  reviewTitle: string
  userName: string
  createdAt: string
}

export const columns: ColumnDef<CommentColumn>[] = [
  {
    accessorKey: "content",
    header: "内容",
    cell: ({ row }) => (
      <div className="max-w-[500px] truncate">
        {row.original.content}
      </div>
    )
  },
  {
    accessorKey: "reviewTitle",
    header: "评测",
  },
  {
    accessorKey: "userName",
    header: "用户",
  },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge variant={
          status === 'APPROVED' ? 'default' :
          status === 'PENDING' ? 'secondary' :
          'destructive'
        }>
          {
            status === 'APPROVED' ? '已通过' :
            status === 'PENDING' ? '待审核' :
            '已拒绝'
          }
        </Badge>
      )
    }
  },
  {
    accessorKey: "createdAt",
    header: "创建时间",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />
  },
] 