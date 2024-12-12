import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import * as z from "zod"

// 分别定义每种类型的验证 schema
const mainImageSchema = z.object({
  mainImage: z.string().nullable()
})

const salesImageSchema = z.object({
  salesImage: z.string().nullable()
})

const videoSchema = z.object({
  videoUrl: z.string().nullable()
})

const detailImagesSchema = z.object({
  detailImages: z.array(z.string())
})

const productImagesSchema = z.object({
  productImages: z.array(z.object({
    url: z.string(),
    order: z.number(),
    description: z.string().optional()
  }))
})

type Params = Promise<{ id: string }>

// 更新产品媒体资源
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
    console.log('收到的更新数据:', json)

    const { id } = await params

    // 检查产品是否存在
    const existing = await prisma.product.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: "产品不存在" },
        { status: 404 }
      )
    }

    // 根据更新类型验证数据
    let updateData: any = {}

    try {
      // 主图更新
      if ('mainImage' in json) {
        const body = mainImageSchema.parse(json)
        updateData.mainImage = body.mainImage
      }

      // 销售图更新
      if ('salesImage' in json) {
        const body = salesImageSchema.parse(json)
        updateData.salesImage = body.salesImage
      }

      // 视频更新
      if ('videoUrl' in json) {
        const body = videoSchema.parse(json)
        updateData.videoUrl = body.videoUrl
      }

      // 详情图片更新
      if ('detailImages' in json) {
        const body = detailImagesSchema.parse(json)
        updateData.detailImages = body.detailImages
      }

      // 产品图片更新
      if ('productImages' in json) {
        const body = productImagesSchema.parse(json)
        updateData.ProductImage = {
          deleteMany: {}, // 先删除所有现有图片
          createMany: {
            data: body.productImages.map(img => ({
              imageUrl: img.url,
              sortOrder: img.order,
              description: img.description || ''
            }))
          }
        }
      }
    } catch (validationError) {
      console.error('数据验证错误:', validationError)
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

    console.log('更新数据:', updateData)

    try {
      // 更新产品媒体资源
      const product = await prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          ProductImage: true
        }
      })

      // 根据更新类型返回相应的数据
      const response: any = { success: true }
      
      if ('mainImage' in updateData) {
        response.mainImage = product.mainImage
      }
      if ('salesImage' in updateData) {
        response.salesImage = product.salesImage
      }
      if ('videoUrl' in updateData) {
        response.videoUrl = product.videoUrl
      }
      if ('detailImages' in updateData) {
        response.detailImages = product.detailImages
      }
      if ('ProductImage' in updateData) {
        response.productImages = product.ProductImage
      }

      return NextResponse.json(response)

    } catch (dbError) {
      console.error('数据库更新错误:', dbError)
      return NextResponse.json(
        { 
          error: "数据库更新失败", 
          details: dbError instanceof Error ? dbError.message : String(dbError),
          updateData
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("更新产品媒体资源失败:", error)
    return NextResponse.json(
      { 
        error: "更新失败", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}