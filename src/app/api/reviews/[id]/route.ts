import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as z from "zod"
import { auth } from "@/lib/auth"

// 更新状态的 schema
const updateSchema = z.object({
  status: z.enum(['PENDING', 'PUBLISHED', 'ARCHIVED']).optional(),
  isRecommended: z.boolean().optional(),
  publishedAt: z.date().optional(),
})

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

type Params = Promise<{ id: string }>

// GET 获取单个测评
export async function GET(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const { id } = await params

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            mainImage: true,
            description: true,
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!review) {
      return NextResponse.json(
        { error: "测评不存在" },
        { status: 404 }
      )
    }

    return NextResponse.json(review)
  } catch (error) {
    console.error('获取测评失败:', error)
    return NextResponse.json(
      { error: "获取测评失败" },
      { status: 500 }
    )
  }
}

// PATCH 更新测评状态
export async function PATCH(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const json = await request.json()
    const body = updateSchema.parse(json)

    // 构建更新数据
    const updateData = {
      ...body,
      ...(body.status === 'PUBLISHED' && {
        publishedAt: new Date()
      })
    }
   
    const { id } = await params
    const review = await prisma.review.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error('更新测评失败:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "更新测评失败" },
      { status: 500 }
    )
  }
}

// PUT 更新测评
export async function PUT(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const json = await request.json()
    const body = reviewSchema.parse(json)
    
    const { id } = await params
    const review = await prisma.review.update({
      where: { id },
      data: body
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error('更新测评失败:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "更新测评失败" },
      { status: 500 }
    )
  }
}

// DELETE 删除测评
export async function DELETE(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const { id } = await params

    // 删除测评及其关联的评论
    await prisma.$transaction([
      prisma.comment.deleteMany({
        where: { reviewId: id }
      }),
      prisma.review.delete({
        where: { id }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除测评失败:', error)
    return NextResponse.json(
      { error: "删除测评失败" },
      { status: 500 }
    )
  }
}