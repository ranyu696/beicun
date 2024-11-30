import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as z from "zod"
import { auth } from "@/lib/auth"

const commentSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED'])
})

type Params = Promise<{ id: string,}>

// PATCH 更新评论状态
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
    const { status } = commentSchema.parse(json)
    const { id } = await params
   
    const comment = await prisma.comment.update({
      where: { id },
      data: { status }
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
    return NextResponse.json(
      { error: "更新评论状态失败" },
      { status: 500 }
    )
  }
}

// DELETE 删除评论
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

    await prisma.comment.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除评论失败:', error)
    return NextResponse.json(
      { error: "删除评论失败" },
      { status: 500 }
    )
  }
}