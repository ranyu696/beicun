import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as z from "zod"
import { auth } from "@/lib/auth"

const brandSchema = z.object({
  name: z.string().min(1, '请输入品牌名称'),
  description: z.string().optional(),
  logo: z.string().optional(),
  website: z.string().url('请输入有效的网址').optional().or(z.literal('')),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean().default(true),
})

// GET 获取单个
type Params = Promise<{ id: string }>
export async function GET(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const { id } = await params
    const brand = await prisma.brand.findUnique({
      where: { id }
    })

    if (!brand) {
      return NextResponse.json(
        { error: "品牌不存在" },
        { status: 404 }
      )
    }

    return NextResponse.json(brand)
  } catch (error) {
    console.error('获取品牌失败:', error)
    return NextResponse.json(
      { error: "获取品牌失败" },
      { status: 500 }
    )
  }
}

// PUT 更新
export async function PUT(
  request: Request,
  { params }: { params: Params }
) {
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
    const { id } = await params
    const brand = await prisma.brand.update({
      where: { id },
      data
    })

    return NextResponse.json(brand)
  } catch (error) {
    console.error('更新品牌失败:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "更新品牌失败" },
      { status: 500 }
    )
  }
}

// PATCH 更新状态
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
    const { isActive } = z.object({
      isActive: z.boolean()
    }).parse(json)
    const { id } = await params

    const brand = await prisma.brand.update({
      where: { id },
      data: { isActive }
    })

    return NextResponse.json(brand)
  } catch (error) {
    console.error('更新品牌状态失败:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "更新品牌状态失败" },
      { status: 500 }
    )
  }
}

// DELETE 删除
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

    // 检查是否有关联的产品
    const productsCount = await prisma.product.count({
      where: { brandId: id }
    })

    if (productsCount > 0) {
      return NextResponse.json(
        { error: "该品牌下存在产品，无法删除" },
        { status: 400 }
      )
    }

    await prisma.brand.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除品牌失败:', error)
    return NextResponse.json(
      { error: "删除品牌失败" },
      { status: 500 }
    )
  }
}