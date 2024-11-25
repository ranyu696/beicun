import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { uploadR2Object } from '@/lib/r2'
import { UPLOAD_DIRS, generateUploadPath } from '@/lib/upload'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    const productId = formData.get('productId') as string
    
    if (!file || !productId) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // 根据类型和产品ID生成文件路径
    const key = generateUploadPath(
      `${UPLOAD_DIRS.PRODUCT.BASE}/${productId}/${type}`,
      file.name
    )

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