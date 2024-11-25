import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"

// 完整的测评 schema
const reviewSchema = z.object({
    title: z.string().min(1, '请输入标题'),
    productId: z.string().min(1, '请选择产品'),
    unboxing: z.string().min(1, '请填写开箱体验'),
    unboxingImages: z.array(z.string()).optional(),
    experience: z.string().min(1, '请填写使用感受'),
    maintenance: z.string().min(1, '请填写清洁与维护建议'),
    pros: z.array(z.string()).min(1, '请至少添加一个优点'),
    cons: z.array(z.string()).min(1, '请至少添加一个缺点'),
    conclusion: z.string().min(1, '请填写总结'),
  })
// GET 获取测评列表
export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const reviews = await prisma.review.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        views: true,
        isRecommended: true,
        publishedAt: true,
        createdAt: true,
        product: {
          select: {
            id: true,
            name: true,
            mainImage: true,
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      },
      orderBy: [
        {
          status: 'asc' // PENDING 排在前面
        },
        {
          createdAt: 'desc'
        }
      ]
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('获取测评列表失败:', error)
    return NextResponse.json(
      { error: "获取测评列表失败" },
      { status: 500 }
    )
  }
}

// POST 创建测评
export async function POST(request: Request) {
    try {
      const session = await auth()
      if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "未授权" }, { status: 401 })
      }
  
      const json = await request.json()
      const body = reviewSchema.parse(json)
  
      const review = await prisma.review.create({
        data: {
          ...body,
          status: 'PENDING',
          userId: session.user.id,
        }
      })
  
      return NextResponse.json(review)
    } catch (error) {
      console.error('创建测评失败:', error)
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "数据验证失败", details: error.errors },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: "创建测评失败" },
        { status: 500 }
      )
    }
  }