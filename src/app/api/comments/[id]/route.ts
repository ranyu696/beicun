import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import * as z from "zod"

const updateSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
})

type Params = Promise<{ id: string }>
// GET 获取单个评论
export async function GET(
  req: Request,
  { params }: { params: Params }
) {
  try {
    const { id } = await params

    const comment = await prisma.comment.findUnique({
      where: {
        id
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
    console.error('获取评论失败:', error)
    return new NextResponse("获取评论失败", { status: 500 })
  }
}

// PATCH 更新评论状态
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
    const { status } = updateSchema.parse(body)

    const { id } = await params

    const comment = await prisma.comment.update({
      where: {
        id
      },
      data: {
        status
      }
    })
  
    return NextResponse.json(comment)
  } catch (error) {
    console.error('更新评论状态失败:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      )
    }
    return new NextResponse("更新评论状态失败", { status: 500 })
  }
}

// DELETE 删除评论
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

    const comment = await prisma.comment.delete({
      where: {
        id
      }
    })
  
    return NextResponse.json(comment)
  } catch (error) {
    console.error('删除评论失败:', error)
    return new NextResponse("删除评论失败", { status: 500 })
  }
} 