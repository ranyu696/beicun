import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as z from "zod"
import { auth } from "@/lib/auth"

// 验证schema
const productTypeSchema = z.object({
  name: z.string().min(1, '请输入类型名称'),
  description: z.string().optional(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean().default(true),
})

// GET 获取列表
export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const productTypes = await prisma.productType.findMany({
      orderBy: {
        sortOrder: 'asc'
      }
    })

    return NextResponse.json(productTypes)
  } catch (error) {
    console.error('获取产品类型列表失败:', error)
    return NextResponse.json(
      { error: "获取产品类型列表失败" },
      { status: 500 }
    )
  }
}

// POST 创建
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const json = await request.json()
    const body = productTypeSchema.parse(json)

    const productType = await prisma.productType.create({
      data: body
    })

    return NextResponse.json(productType)
  } catch (error) {
    console.error('创建产品类型失败:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "创建产品类型失败" },
      { status: 500 }
    )
  }
}