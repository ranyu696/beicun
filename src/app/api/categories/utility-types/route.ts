import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as z from "zod"
import { auth } from "@/lib/auth"

// 验证schema
const utilityTypeSchema = z.object({
  name: z.string().min(1, '请输入类型名称'),
  description: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean().default(true),
})

// POST 创建
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const json = await request.json()
    const body = utilityTypeSchema.parse(json)

    const utilityType = await prisma.utilityType.create({
      data: body
    })

    return NextResponse.json(utilityType)
  } catch (error) {
    console.error('创建器具类型失败:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "创建器具类型失败" },
      { status: 500 }
    )
  }
}

// GET 获取列表
export async function GET() {
  try {
    const utilityTypes = await prisma.utilityType.findMany({
      orderBy: {
        sortOrder: 'asc'
      }
    })

    return NextResponse.json(utilityTypes)
  } catch (error) {
    console.error('获取器具类型列表失败:', error)
    return NextResponse.json(
      { error: "获取器具类型列表失败" },
      { status: 500 }
    )
  }
} 