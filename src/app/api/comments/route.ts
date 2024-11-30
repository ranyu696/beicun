import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import * as z from "zod"

// 验证schema
const createCommentSchema = z.object({
  content: z.string().min(1, "请输入评论内容"),
  reviewId: z.string().min(1, "评测ID必填"),
})

// POST 创建评论
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const json = await request.json()
    const body = createCommentSchema.parse(json)

    // 检查评测是否存在
    const review = await prisma.review.findUnique({
      where: { id: body.reviewId }
    })

    if (!review) {
      return NextResponse.json(
        { error: "评测不存在" },
        { status: 404 }
      )
    }

    // 创建评论
    const comment = await prisma.comment.create({
      data: {
        content: body.content,
        reviewId: body.reviewId,
        userId: session.user.id,
        status: 'PENDING' // 默认待审核
      },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        },
        review: {
          select: {
            title: true
          }
        }
      }
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error('创建评论失败:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "创建评论失败" },
      { status: 500 }
    )
  }
}

// GET 获取评论列表
export async function GET() {
  try {
    const comments = await prisma.comment.findMany({
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        },
        review: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('获取评论列表失败:', error)
    return NextResponse.json(
      { error: "获取评论列表失败" },
      { status: 500 }
    )
  }
} 