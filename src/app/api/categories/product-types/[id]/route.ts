import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as z from "zod"
import { auth } from "@/lib/auth"


const productTypeSchema = z.object({
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

    const productType = await prisma.productType.findUnique({
      where: { id: params.id }
    })

    if (!productType) {
      return NextResponse.json(
        { error: "产品类型不存在" },
        { status: 404 }
      )
    }

    return NextResponse.json(productType)
  } catch (error) {
    console.error('获取产品类型失败:', error)
    return NextResponse.json(
      { error: "获取产品类型失败" },
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
    const body = productTypeSchema.parse(json)

    const productType = await prisma.productType.update({
      where: { id: params.id },
      data: body
    })

    return NextResponse.json(productType)
  } catch (error) {
    console.error('更新产品类型失败:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "更新产品类型失败" },
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

    const productType = await prisma.productType.update({
      where: { id: params.id },
      data: { isActive }
    })

    return NextResponse.json(productType)
  } catch (error) {
    console.error('更新产品类型状态失败:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "更新产品类型状态失败" },
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
      where: { productTypeId: params.id }
    })

    if (productsCount > 0) {
      return NextResponse.json(
        { error: "该类型下存在产品，无法删除" },
        { status: 400 }
      )
    }

    await prisma.productType.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除产品类型失败:', error)
    return NextResponse.json(
      { error: "删除产品类型失败" },
      { status: 500 }
    )
  }
}