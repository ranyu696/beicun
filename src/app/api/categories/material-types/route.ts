import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as z from "zod"
import { auth } from "@/lib/auth"


// 验证schema
const materialTypeSchema = z.object({
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

    const materialTypes = await prisma.materialType.findMany({
      orderBy: {
        sortOrder: 'asc'
      }
    })

    return NextResponse.json(materialTypes)
  } catch (error) {
    console.error('获取材料类型列表失败:', error)
    return NextResponse.json(
      { error: "获取材料类型列表失败" },
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
    const body = materialTypeSchema.parse(json)

    const materialType = await prisma.materialType.create({
      data: body
    })

    return NextResponse.json(materialType)
  } catch (error) {
    console.error('创建材料类型失败:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "创建材料类型失败" },
      { status: 500 }
    )
  }
}