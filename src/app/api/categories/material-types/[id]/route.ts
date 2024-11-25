import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as z from "zod"
import { auth } from "@/lib/auth"


const materialTypeSchema = z.object({
  name: z.string().min(1, '请输入类型名称'),
  description: z.string().optional(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean().default(true),
})

// GET 获取单个
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const materialType = await prisma.materialType.findUnique({
      where: { id: params.id }
    })

    if (!materialType) {
      return NextResponse.json(
        { error: "材料类型不存在" },
        { status: 404 }
      )
    }

    return NextResponse.json(materialType)
  } catch (error) {
    console.error('获取材料类型失败:', error)
    return NextResponse.json(
      { error: "获取材料类型失败" },
      { status: 500 }
    )
  }
}

// PUT 更新
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
    const body = materialTypeSchema.parse(json)

    const materialType = await prisma.materialType.update({
      where: { id: params.id },
      data: body
    })

    return NextResponse.json(materialType)
  } catch (error) {
    console.error('更新材料类型失败:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "更新材料类型失败" },
      { status: 500 }
    )
  }
}

// PATCH 更新状态
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const json = await request.json()
    const { isActive } = z.object({
      isActive: z.boolean()
    }).parse(json)

    const materialType = await prisma.materialType.update({
      where: { id: params.id },
      data: { isActive }
    })

    return NextResponse.json(materialType)
  } catch (error) {
    console.error('更新材料类型状态失败:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "更新材料类型状态失败" },
      { status: 500 }
    )
  }
}

// DELETE 删除
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    // 检查是否有关联的产品
    const productsCount = await prisma.product.count({
      where: { materialTypeId: params.id }
    })

    if (productsCount > 0) {
      return NextResponse.json(
        { error: "该类型下存在产品，无法删除" },
        { status: 400 }
      )
    }

    await prisma.materialType.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除材料类型失败:', error)
    return NextResponse.json(
      { error: "删除材料类型失败" },
      { status: 500 }
    )
  }
}