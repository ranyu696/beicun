import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as z from "zod"
import { auth } from "@/lib/auth"

// 创建产品的数据验证
const productSchema = z.object({
  // 基本信息
  name: z.string().min(1, '请输入产品名称'),
  slug: z.string().min(1, '请输入URL标识'),
  price: z.number().min(0, '价格不能小于0'),
  brandId: z.string().min(1, '请选择品牌'),
  productTypeId: z.string().min(1, '请选择产品类型'),
  channelTypeId: z.string().min(1, '请选择通道类型'),
  materialTypeId: z.string().min(1, '请选择材料类型'),
  utilityTypeId: z.string().min(1, '请选择器具类型'),
  description: z.string().optional(),
  taobaoUrl: z.string().url('请输入有效的淘宝链接').optional(),
  
  // 规格参数
  registrationDate: z.string().transform(str => new Date(str)),
  height: z.number().min(0),
  width: z.number().min(0),
  length: z.number().min(0),
  channelLength: z.number().min(0),
  totalLength: z.number().min(0),
  weight: z.number().min(0),
  version: z.string(),
  isReversible: z.boolean(),
  
  // 产品特性
  stimulation: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  softness: z.enum(['ULTRA_SOFT', 'SOFT', 'MEDIUM', 'HARD', 'ULTRA_HARD']),
  tightness: z.enum(['TIGHT', 'MEDIUM', 'LOOSE']),
  smell: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  oiliness: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  durability: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  
  // 媒体资源
  mainImage: z.string().min(1, '请上传产品主图'),
  salesImage: z.string().min(1, '请上传销售图'),
  videoUrl: z.string().optional(),
  detailImages: z.array(z.string()),
  productImages: z.array(z.object({
    id: z.string(),
    url: z.string(),
    order: z.number()
  })).default([]),
  
  // 标签
  tagIds: z.array(z.string()).optional()
})


// 获取产品列表
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: search,
          mode: 'insensitive'
        }
      },
      include: {
        brand: true,
        productType: true,
        channelType: true,
        materialType: true,
        tags: {
          include: {
            tag: true
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    })

    const total = await prisma.product.count({
      where: {
        name: {
          contains: search,
          mode: 'insensitive'
        }
      }
    })

    return NextResponse.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("获取产品列表失败:", error)
    return NextResponse.json(
      { error: "获取产品列表失败" },
      { status: 500 }
    )
  }
}

// 创建产品
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const json = await request.json()
    const body = productSchema.parse(json)

    // 检查 slug 是否已存在
    const existing = await prisma.product.findUnique({
      where: { slug: body.slug }
    })

    if (existing) {
      return NextResponse.json(
        { error: "URL标识已存在" },
        { status: 400 }
      )
    }

    // 创建产品
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        price: body.price,
        brandId: body.brandId,
        productTypeId: body.productTypeId,
        channelTypeId: body.channelTypeId,
        materialTypeId: body.materialTypeId,
        utilityTypeId: body.utilityTypeId,
        description: body.description,
        taobaoUrl: body.taobaoUrl,
        registrationDate: body.registrationDate,
        height: body.height,
        width: body.width,
        length: body.length,
        channelLength: body.channelLength,
        totalLength: body.totalLength,
        weight: body.weight,
        version: body.version,
        isReversible: body.isReversible,
        stimulation: body.stimulation,
        softness: body.softness,
        tightness: body.tightness,
        smell: body.smell,
        oiliness: body.oiliness,
        durability: body.durability,
        mainImage: body.mainImage,
        salesImage: body.salesImage,
        videoUrl: body.videoUrl,
        detailImages: body.detailImages,
        // 处理产品图片
        ProductImage: {
          createMany: {
            data: body.productImages.map(img => ({
              imageUrl: img.url,
              sortOrder: img.order
            }))
          }
        },
        // 处理标签关联
        tags: body.tagIds ? {
          create: body.tagIds.map(tagId => ({
            tagId
          }))
        } : undefined
      },
      include: {
        brand: true,
        productType: true,
        channelType: true,
        materialType: true,
        utilityType: true,
        ProductImage: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("创建产品失败:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "创建产品失败" },
      { status: 500 }
    )
  }
}