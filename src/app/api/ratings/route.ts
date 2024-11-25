import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { NextResponse } from "next/server"

// 验证请求数据
const ratingSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().min(1).max(5),
  reason: z.string().nullable()
})

// 自定义错误类
class RatingError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'RatingError'
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = ratingSchema.parse(body)

    // 检查产品是否存在并包含用户评分
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
      include: {
        ratings: {
          where: { userId: session.user.id }
        }
      }
    })
    console.log('Found product:', product) // 添加日志
    if (!product) {
      return NextResponse.json(
        { error: "产品不存在" },
        { status: 404 }
      )
    }

    // 检查用户是否已经评分
    if (product.ratings.length > 0) {
      return NextResponse.json(
        { error: "您已经评分过此产品" },
        { status: 400 }
      )
    }

    // 使用事务确保数据一致性
    const result = await prisma.$transaction(async (tx) => {
      // 创建评分
      const rating = await tx.productRating.create({
        data: {
          rating: validatedData.rating,
          reason: validatedData.reason,
          userId: session.user.id,
          productId: validatedData.productId
        }
      })

      // 更新产品的平均评分和总评分数
      const updatedRatings = await tx.productRating.aggregate({
        where: { productId: validatedData.productId },
        _avg: { rating: true },
        _count: true
      })

      await tx.product.update({
        where: { id: validatedData.productId },
        data: {
          averageRating: updatedRatings._avg.rating || 0,
          totalRatings: updatedRatings._count
        }
      })

      return rating
    })

    return NextResponse.json({
      success: true,
      rating: result
    })

  } catch (error) {
    console.error("Rating creation error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "无效的评分数据", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "评分提交失败" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json(
        { error: "缺少产品ID" },
        { status: 400 }
      )
    }

    const rating = await prisma.productRating.findFirst({
      where: {
        productId,
        userId: session.user.id
      }
    })

    return NextResponse.json({ rating })

  } catch (error) {
    console.error("Rating fetch error:", error)
    return NextResponse.json(
      { error: "获取评分失败" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new RatingError("请先登录", 401)
    }

    const body = await request.json()
    const validatedData = ratingSchema.parse(body)

    // 使用事务确保数据一致性
    const result = await prisma.$transaction(async (tx) => {
      // 查找并更新评分
      const rating = await tx.productRating.findFirst({
        where: {
          productId: validatedData.productId,
          userId: session.user.id
        }
      })

      if (!rating) {
        throw new RatingError("评分不存在", 404)
      }

      const updatedRating = await tx.productRating.update({
        where: { id: rating.id },
        data: {
          rating: validatedData.rating,
          reason: validatedData.reason
        }
      })

      // 更新产品的平均评分
      const updatedRatings = await tx.productRating.aggregate({
        where: { productId: validatedData.productId },
        _avg: { rating: true }
      })

      await tx.product.update({
        where: { id: validatedData.productId },
        data: {
          averageRating: updatedRatings._avg.rating || 0
        }
      })

      return updatedRating
    })

    return NextResponse.json({
      success: true,
      rating: result
    })

  } catch (error: unknown) {
    console.error("Rating update error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "无效的评分数据", details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof RatingError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "评分更新失败" },
      { status: 500 }
    )
  }
}