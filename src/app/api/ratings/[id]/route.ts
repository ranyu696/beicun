import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import * as z from "zod"

const ratingSchema = z.object({
  rating: z.number().min(1).max(5),
  reason: z.string().optional(),
  productId: z.string().min(1),
  userId: z.string().min(1),
})

type Params = Promise<{ id: string }>

export async function DELETE(
  req: Request,
  { params }: { params: Params }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse("未授权", { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return new NextResponse("评分ID必填", { status: 400 })
    }

    const rating = await prisma.productRating.delete({
      where: {
        id
      }
    })
  
    return NextResponse.json(rating)
  } catch (error) {
    console.error('删除评分失败:', error)
    return new NextResponse("删除评分失败", { status: 500 })
  }
}

// PATCH 更新评分
export async function PATCH(
  req: Request,
  { params }: { params: Params }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse("未授权", { status: 401 })
    }

    const body = await req.json()
    const { rating, reason, productId, userId } = ratingSchema.parse(body)

    const { id } = await params
    if (!id) {
      return new NextResponse("评分ID必填", { status: 400 })
    }

    const updatedRating = await prisma.productRating.update({
      where: {
        id
      },
      data: {
        rating,
        reason,
        productId,
        userId
      }
    })
  
    return NextResponse.json(updatedRating)
  } catch (error) {
    console.error('更新评分失败:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      )
    }
    return new NextResponse("更新评分失败", { status: 500 })
  }
} 