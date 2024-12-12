import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import * as z from "zod"
import { Prisma } from "@prisma/client"
import {  deleteR2Folder } from '@/lib/r2'

// 简化的产品更新验证 schema
const productUpdateSchema = z.object({
  // 基本字段
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  description: z.string().nullish(),
  taobaoUrl: z.string().nullish(),
  
  // 数值字段 - 使用 Prisma 的 set 操作
  height: z.number().min(0).optional(),
  width: z.number().min(0).optional(),
  length: z.number().min(0).optional(),
  channelLength: z.number().min(0).optional(),
  totalLength: z.number().min(0).optional(),
  weight: z.number().min(0).optional(),
  
  // 其他字段
  version: z.string().optional(),
  isReversible: z.boolean().optional(),
  registrationDate: z.string().transform(str => new Date(str)).optional(),
  
  // 枚举字段
  stimulation: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  softness: z.enum(['ULTRA_SOFT', 'SOFT', 'MEDIUM', 'HARD', 'ULTRA_HARD']).optional(),
  tightness: z.enum(['TIGHT', 'MEDIUM', 'LOOSE']).optional(),
  smell: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  oiliness: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  
  // 关联ID
  brandId: z.string().optional(),
  productTypeId: z.string().optional(),
  channelTypeId: z.string().optional(),
  materialTypeId: z.string().optional(),
  utilityTypeId: z.string().optional(),
  
  // 标签
  tagIds: z.array(z.string()).optional()
})

type Params = Promise<{ id: string }>

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
    const body = productUpdateSchema.parse(json)

    // 构建 Prisma 更新数据
    const updateData: Prisma.ProductUpdateInput = {
      ...(body.name && { name: body.name }),
      ...(body.slug && { slug: body.slug }),
      ...(body.price && { price: body.price }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.taobaoUrl !== undefined && { taobaoUrl: body.taobaoUrl }),
      ...(body.height !== undefined && { height: body.height }),
      ...(body.width !== undefined && { width: body.width }),
      ...(body.length !== undefined && { length: body.length }),
      ...(body.channelLength !== undefined && { channelLength: body.channelLength }),
      ...(body.totalLength !== undefined && { totalLength: body.totalLength }),
      ...(body.weight !== undefined && { weight: body.weight }),
      ...(body.version !== undefined && { version: body.version }),
      ...(body.isReversible !== undefined && { isReversible: body.isReversible }),
      ...(body.registrationDate && { registrationDate: body.registrationDate }),
      ...(body.stimulation !== undefined && { stimulation: body.stimulation }),
      ...(body.softness !== undefined && { softness: body.softness }),
      ...(body.tightness !== undefined && { tightness: body.tightness }),
      ...(body.smell !== undefined && { smell: body.smell }),
      ...(body.oiliness !== undefined && { oiliness: body.oiliness }),
      ...(body.brandId && { brand: { connect: { id: body.brandId } } }),
      ...(body.productTypeId && { productType: { connect: { id: body.productTypeId } } }),
      ...(body.channelTypeId && { channelType: { connect: { id: body.channelTypeId } } }),
      ...(body.materialTypeId && { materialType: { connect: { id: body.materialTypeId } } }),
      ...(body.utilityTypeId && { utilityType: { connect: { id: body.utilityTypeId } } }),
      ...(body.tagIds && {
        tags: {
          deleteMany: {},
          create: body.tagIds.map(tagId => ({ tagId }))
        }
      })
    }

    const { id } = await params
    const product = await prisma.product.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(product)

  } catch (error) {
    console.error("��新产品失败:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "数据验证失败", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "更新失败" }, { status: 500 })
  }
}

// 删除产品
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
    
    // 检查产品是否存在
    const existing = await prisma.product.findUnique({
      where: { id },
      include: {
        ProductImage: true,  // 产品图片
        ratings: true,       // 产品评分
        reviews: true,       // 产品测评
        tags: true,         // 产品标签
      }
    })

    if (!existing) {
      return NextResponse.json(
        { error: "产品不存在" },
        { status: 404 }
      )
    }

    // 开始事务处理
    await prisma.$transaction(async (tx) => {
      // 1. 删除产品评分
      await tx.productRating.deleteMany({
        where: { productId: id }
      })

      // 2. 删除产品评论(评测下的评论)
      await tx.comment.deleteMany({
        where: { 
          review: {
            productId: id
          }
        }
      })

      // 3. 删除产品评测
      await tx.review.deleteMany({
        where: { productId: id }
      })

      // 4. 删除产品标签关联
      await tx.productTag.deleteMany({
        where: { productId: id }
      })

      // 5. 删除产品图片
      await tx.productImage.deleteMany({
        where: { productId: id }
      })

      // 6. 最后删除产品本身
      await tx.product.delete({
        where: { id }
      })
    })

    // 删除 R2 中的文件夹
    try {
      await deleteR2Folder(`products/${id}`)
    } catch (error) {
      console.error(`删除产品文件夹失败: products/${id}`, error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("删除产品失败:", error)
    return NextResponse.json(
      { error: "删除产品失败" },
      { status: 500 }
    )
  }
}