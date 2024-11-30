"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ProductRating } from "@prisma/client"
import { format } from "date-fns"
import { Star } from "lucide-react"

export type RatingColumn = {
  id: string
  rating: number
  reason: string | null
  productName: string
  userName: string
  createdAt: string
}

export const columns: ColumnDef<RatingColumn>[] = [
  {
    accessorKey: "productName",
    header: "产品",
  },
  {
    accessorKey: "userName",
    header: "用户",
  },
  {
    accessorKey: "rating",
    header: "评分",
    cell: ({ row }) => {
      const rating = row.getValue("rating") as number
      return (
        <div className="flex items-center">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
          <span>{rating.toFixed(1)}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "reason",
    header: "评分理由",
  },
  {
    accessorKey: "createdAt",
    header: "评分时间",
  }
] 