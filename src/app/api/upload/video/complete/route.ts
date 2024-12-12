import { NextResponse } from 'next/server'
import { completeMultipartUpload } from '@/lib/r2'

export async function POST(req: Request) {
  try {
    const { key, uploadId } = await req.json()

    // 完成分片上传
    await completeMultipartUpload(key, uploadId)

    // 返回完整的文件URL
    const url = `${process.env.R2_PUBLIC_URL}/${key}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error('完成上传失败:', error)
    return NextResponse.json(
      { error: 'Failed to complete upload' },
      { status: 500 }
    )
  }
} 