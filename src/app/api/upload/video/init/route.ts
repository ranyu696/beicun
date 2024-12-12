import { NextResponse } from 'next/server'
import { createMultipartUpload } from '@/lib/r2'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const fileName = formData.get('fileName') as string
    const productId = formData.get('productId') as string
    
    // 生成文件路径
    const key = `products/${productId}/videos/${Date.now()}-${fileName}`
    
    // 创建分片上传任务
    const { uploadId } = await createMultipartUpload(key)

    return NextResponse.json({ uploadId, key })
  } catch (error) {
    console.error('初始化上传失败:', error)
    return NextResponse.json(
      { error: '初始化上传失败' },
      { status: 500 }
    )
  }
} 