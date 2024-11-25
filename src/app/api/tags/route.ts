import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as z from "zod"
import { auth } from "@/lib/auth"
const tagSchema = z.object({
  name: z.string().min(1, '请输入标签名称'),
})

// GET 获取标签列表
export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error('获取标签列表失败:', error)
    return NextResponse.json(
      { error: "获取标签列表失败" },
      { status: 500 }
    )
  }
}

// POST 创建标签
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const json = await request.json()
    const { name } = tagSchema.parse(json)

    // 检查标签名是否已存在
    const existingTag = await prisma.tag.findUnique({
      where: { name }
    })

    if (existingTag) {
      return NextResponse.json(
        { error: "标签名已存在" },
        { status: 400 }
      )
    }

    const tag = await prisma.tag.create({
      data: { name }
    })

    return NextResponse.json(tag)
  } catch (error) {
    console.error('创建标签失败:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "创建标签失败" },
      { status: 500 }
    )
  }
}