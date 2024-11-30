import { prisma } from "@/lib/prisma"
import { RatingForm } from "@/components/admin/ratings/rating-form"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import React from "react"

export const metadata: Metadata = {
  title: "编辑评分 - 后台管理",
  description: "编辑评分信息",
}

type Params = Promise<{ id: string }>

export default async function RatingPage({ params }: { params: Params }) {
  const { id } = await params

  const [rating, products, usersData] = await Promise.all([
    id === "new" ? undefined : prisma.productRating.findUnique({
      where: {
        id
      }
    }),
    prisma.product.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    })
  ])

  if (id !== "new" && !rating) {
    notFound()
  }

  // 处理用户数据，确保 name 不为 null
  const users = usersData.map(user => ({
    id: user.id,
    name: user.name || '匿名用户'
  }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <RatingForm
          initialData={rating || undefined}
          products={products}
          users={users}
        />
      </div>
    </div>
  )
} 