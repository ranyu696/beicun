import { NextResponse } from "next/server"
import { auth} from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import * as z from "zod"

const productSchema = z.object({
    // 基本信息
    name: z.string().min(1, '请输入产品名称'),
    slug: z.string().min(1, '请输入URL标识'),
    price: z.number().min(0, '价格不能小于0'),
    brandId: z.string().min(1, '请选择品牌'),
    productTypeId: z.string().min(1, '请选择产品类型'),
    channelTypeId: z.string().min(1, '请选择通道类型'),
    materialTypeId: z.string().min(1, '请选择材料类型'),
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
    
    // 媒体资源
    mainImage: z.string().min(1, '请上传产品主图'),
    salesImage: z.string().min(1, '请上传销售图'),
    videoUrl: z.string().optional(),
    detailImages: z.array(z.string()),
    productImages: z.array(z.object({
      url: z.string(),
      order: z.number(),
      description: z.string().optional()
    })).optional(),
    
    // 标签
    tagIds: z.array(z.string()).optional()
  })
  
// 1. 定义媒体更新的验证 schema
const mediaUpdateSchema = z.object({
  mainImage: z.string().optional(),
  salesImage: z.string().optional(),
  videoUrl: z.string().optional(),
  detailImages: z.array(z.string()).optional(),
  productImages: z.array(z.object({
    url: z.string(),
    order: z.number(),
    description: z.string().optional()
  })).optional()
})

// 更新产品
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
    console.log('接收到的更新数据:', json) // 添加日志

    // 判断是否为媒体更新
    const isMediaUpdate = json.mainImage !== undefined || 
                         json.salesImage !== undefined || 
                         json.videoUrl !== undefined || 
                         json.detailImages !== undefined || 
                         json.productImages !== undefined

    let body
    try {
      if (isMediaUpdate) {
        body = mediaUpdateSchema.parse(json)
      } else {
        body = productSchema.parse(json)
      }
    } catch (validationError) {
      console.error('验证错误:', validationError) // 添加详细的验证错误日志
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: "数据验证失败", 
            details: validationError.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message
            }))
          },
          { status: 400 }
        )
      }
      throw validationError
    }

    // 检查产品是否存在
    const existing = await prisma.product.findUnique({
      where: { id: params.id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: "产品不存在" },
        { status: 404 }
      )
    }

    // 构建更新数据
    const updateData: any = { ...body }

    // 如果更新产品图片
    if (body.productImages) {
      updateData.ProductImage = {
        deleteMany: {},
        createMany: {
          data: body.productImages.map(img => ({
            imageUrl: img.url,
            sortOrder: img.order,
            description: img.description || ''
          }))
        }
      }
      delete updateData.productImages
    }

    console.log('更新数据:', updateData) // 添加日志

    // 更新产品
    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
      include: {
        brand: true,
        productType: true,
        channelType: true,
        materialType: true,
        ProductImage: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    console.error("更新产品失败:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "数据验证失败", 
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "更新产品失败: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}

// 删除产品
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth() 
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    // 检查产品是否存在
    const existing = await prisma.product.findUnique({
      where: { id: params.id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: "产品不存在" },
        { status: 404 }
      )
    }

    // 删除产品
    await prisma.product.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("删除产品失败:", error)
    return NextResponse.json(
      { error: "删除产品失败" },
      { status: 500 }
    )
  }
}