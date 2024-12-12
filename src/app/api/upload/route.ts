import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { uploadR2Object } from '@/lib/r2'
import { UPLOAD_DIRS, generateUploadPath, validateFileSize, validateFileType } from '@/lib/upload'
import sharp from 'sharp'
import { getDatePath } from '@/lib/utils'

const MAX_FILE_SIZE = 1000 * 1024 * 1024 // 100MB
const ALLOWED_IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'webp']

// 定义上传类型
type UploadType = 
  | 'main'      // 产品主图
  | 'sales'     // 销售图
  | 'detail'    // 详情图片
  | 'product'   // 产品图文
  | 'editor'    // 编辑器
  | 'avatar'    // 头像
  | 'icon'      // 图标
  | 'logo'      // 品牌logo

export async function POST(req: Request) {
  try {
    // 验证权限
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as UploadType
    const productId = formData.get('productId') as string | undefined
    const brandId = formData.get('brandId') as string | undefined
    
    if (!file || !type) {
      return NextResponse.json({ 
        error: "缺少必要参数",
        details: !file ? "缺少文件" : "缺少上传类型"
      }, { status: 400 })
    }

    // 验证文件大小
    if (!validateFileSize(file, MAX_FILE_SIZE)) {
      return NextResponse.json({ 
        error: "文件大小超过限制",
        details: `文件大小不能超过 ${MAX_FILE_SIZE / 1024 / 1024}MB`
      }, { status: 400 })
    }

    // 验证文件格式
    if (!validateFileType(file.name, ALLOWED_IMAGE_TYPES)) {
      return NextResponse.json({ 
        error: "不支持的文件类型",
        details: `仅支持 ${ALLOWED_IMAGE_TYPES.join(', ')} 格式`
      }, { status: 400 })
    }

    // 读取文件内容并转换为 WebP
    const buffer = Buffer.from(await file.arrayBuffer())
    let processedBuffer: Buffer

    try {
      // 使用 Sharp 处理图片
      processedBuffer = await sharp(buffer)
        .webp({ 
          quality: 80, // 设置压缩质量
          effort: 6,   // 设置压缩效果（0-6）
        })
        .toBuffer()
    } catch (error) {
      console.error("图片处理失败:", error)
      return NextResponse.json({
        error: "图片处理失败",
        details: "图片转换过程中出错"
      }, { status: 400 })
    }

    // 根据类型确定上传路径
    let uploadPath: string
    switch (type) {
      case 'main':
        if (!productId) throw new Error('缺少产品ID')
        uploadPath = `${UPLOAD_DIRS.PRODUCT.BASE}/${productId}/${UPLOAD_DIRS.PRODUCT.MAIN}`
        break
      case 'sales':
        if (!productId) throw new Error('缺少产品ID')
        uploadPath = `${UPLOAD_DIRS.PRODUCT.BASE}/${productId}/${UPLOAD_DIRS.PRODUCT.SALES}`
        break
      case 'detail':
        if (!productId) throw new Error('缺少产品ID')
        uploadPath = `${UPLOAD_DIRS.PRODUCT.BASE}/${productId}/${UPLOAD_DIRS.PRODUCT.DETAILS}`
        break
      case 'product':
        if (!productId) throw new Error('缺少产品ID')
        uploadPath = `${UPLOAD_DIRS.PRODUCT.BASE}/${productId}/${UPLOAD_DIRS.PRODUCT.GALLERY}`
        break
      case 'editor':
        uploadPath = `${UPLOAD_DIRS.EDITOR}/${getDatePath()}`
        break
      case 'avatar':
        uploadPath = UPLOAD_DIRS.USER.AVATARS
        break
      case 'icon':
        uploadPath = UPLOAD_DIRS.UTILITY_TYPE.ICONS
        break
      case 'logo':
        uploadPath = UPLOAD_DIRS.BRAND.LOGOS
        break
      default:
        throw new Error('无效的上传类型')
    }

    // 修改文件名为 .webp 后缀
    const fileName = file.name.split('.').slice(0, -1).join('.') + '.webp'
    
    // 生成文件路径并上传
    const key = generateUploadPath(uploadPath, fileName)
    const result = await uploadR2Object(
      processedBuffer, 
      key, 
      'image/webp' // 设置正确的 MIME 类型
    )

    // 返回文件URL
    if (result) {
      const url = `${process.env.R2_PUBLIC_URL}/${key}`
      return NextResponse.json({ 
        success: true,
        url,
        type,
        originalName: fileName,
        size: processedBuffer.length,
        format: 'webp'
      })
    }

    throw new Error('文件上传失败')

  } catch (error) {
    console.error("上传文件失败:", error)
    return NextResponse.json(
      { 
        error: "上传失败", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// 添加配置以支持大文件上传
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
}