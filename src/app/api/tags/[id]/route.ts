import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as z from "zod"
import { auth } from "@/lib/auth"

const tagSchema = z.object({
  name: z.string().min(1, '请输入标签名称'),
})

// PUT 更新标签
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const json = await request.json()
    const { name } = tagSchema.parse(json)

    // 检查新名称是否与其他标签重复
    const existingTag = await prisma.tag.findFirst({
      where: {
        name,
        NOT: {
          id: params.id
        }
      }
    })

    if (existingTag) {
      return NextResponse.json(
        { error: "标签名已存在" },
        { status: 400 }
      )
    }

    const tag = await prisma.tag.update({
      where: { id: params.id },
      data: { name }
    })

    return NextResponse.json(tag)
  } catch (error) {
    console.error('更新标签失败:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "更新标签失败" },
      { status: 500 }
    )
  }
}

// DELETE 删除标签
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    // 检查标签是否有关联的产品
    const tag = await prisma.tag.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    if (!tag) {
      return NextResponse.json(
        { error: "标签不存在" },
        { status: 404 }
      )
    }

    if (tag._count.products > 0) {
      return NextResponse.json(
        { error: "标签已被产品使用，无法删除" },
        { status: 400 }
      )
    }

    await prisma.tag.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除标签失败:', error)
    return NextResponse.json(
      { error: "删除标签失败" },
      { status: 500 }
    )
  }
}