import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { uploadR2Object } from '@/lib/r2'
import { UPLOAD_DIRS, generateUploadPath, validateFileSize, validateFileType } from '@/lib/upload'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'webp']

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    const productId = formData.get('productId') as string | undefined
    
    if (!file || !type) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 })
    }

    // 验证文件
    if (!validateFileSize(file, MAX_FILE_SIZE)) {
      return NextResponse.json({ error: "文件大小超过限制" }, { status: 400 })
    }

    if (!validateFileType(file.name, ALLOWED_IMAGE_TYPES)) {
      return NextResponse.json({ error: "不支持的文件类型" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // 根据类型确定上传路径
    let uploadPath: string
    switch (type) {
      case 'editor':
        uploadPath = UPLOAD_DIRS.EDITOR
        break
      case 'product-main':
        uploadPath = `${UPLOAD_DIRS.PRODUCT.BASE}/${productId}/${UPLOAD_DIRS.PRODUCT.MAIN}`
        break
      case 'product-details':
        uploadPath = `${UPLOAD_DIRS.PRODUCT.BASE}/${productId}/${UPLOAD_DIRS.PRODUCT.DETAILS}`
        break
      case 'review-unboxing':
        uploadPath = UPLOAD_DIRS.REVIEW.UNBOXING
        break
      case 'review-content':
        uploadPath = UPLOAD_DIRS.REVIEW.CONTENT
        break
      case 'avatar':
        uploadPath = UPLOAD_DIRS.USER.AVATARS
        break
      case 'utility-type-icon':
        uploadPath = UPLOAD_DIRS.UTILITY_TYPE.ICONS
        break
      default:
        uploadPath = UPLOAD_DIRS.EDITOR
    }

    const key = generateUploadPath(uploadPath, file.name)
    await uploadR2Object(buffer, key, file.type)

    const url = `${process.env.R2_PUBLIC_URL}/${key}`
    return NextResponse.json({ url })

  } catch (error) {
    console.error("上传文件失败:", error)
    return NextResponse.json(
      { error: "上传失败: " + error },
      { status: 500 }
    )
  }
}