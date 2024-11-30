import { DataTable } from "@/components/ui/data-table"
import { columns } from "@/components/admin/ratings/columns"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "产品评分 - 后台管理",
  description: "管理产品评分",
}

export default async function RatingsPage() {
  const ratings = await prisma.productRating.findMany({
    include: {
      user: {
        select: {
          name: true,
        }
      },
      product: {
        select: {
          name: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const formattedRatings = ratings.map((rating) => ({
    id: rating.id,
    rating: rating.rating,
    reason: rating.reason,
    productName: rating.product.name,
    userName: rating.user.name || '匿名用户',
    createdAt: format(rating.createdAt, 'yyyy-MM-dd HH:mm:ss'),
  }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">产品评分管理</h2>
        </div>
        <DataTable 
          columns={columns} 
          data={formattedRatings} 
          searchKey="productName" 
        />
      </div>
    </div>
  )
} 