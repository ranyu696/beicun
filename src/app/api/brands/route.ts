import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as z from "zod"
import { auth } from "@/lib/auth"

// 验证schema
const brandSchema = z.object({
  name: z.string().min(1, '请输入品牌名称'),
  description: z.string().optional(),
  logo: z.string().optional(),
  website: z.string().url('请输入有效的网址').optional().or(z.literal('')),
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

    const brands = await prisma.brand.findMany({
      orderBy: {
        sortOrder: 'asc'
      }
    })

    return NextResponse.json(brands)
  } catch (error) {
    console.error('获取品牌列表失败:', error)
    return NextResponse.json(
      { error: "获取品牌列表失败" },
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
    const body = brandSchema.parse(json)

    // 处理可选字段
    const data = {
      ...body,
      description: body.description || null,
      logo: body.logo || null,
      website: body.website || null,
    }

    const brand = await prisma.brand.create({
      data
    })

    return NextResponse.json(brand)
  } catch (error) {
    console.error('创建品牌失败:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "创建品牌失败" },
      { status: 500 }
    )
  }
}