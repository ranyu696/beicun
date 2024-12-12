import { NextResponse } from 'next/server'
import { uploadR2Object } from '@/lib/r2'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const chunk = formData.get('chunk') as Blob
    const key = formData.get('key') as string
    const chunkNumber = parseInt(formData.get('chunkNumber') as string)
    const uploadId = formData.get('uploadId') as string

    // 上传分片
    const buffer = Buffer.from(await chunk.arrayBuffer())
    const result = await uploadR2Object(buffer, key, 'video/mp4', {
      uploadId,
      partNumber: chunkNumber + 1 // 分片编号从1开始
    })

    return NextResponse.json({ success: true, etag: result.ETag })
  } catch (error) {
    console.error('上传分片失败:', error)
    return NextResponse.json(
      { error: 'Failed to upload chunk' },
      { status: 500 }
    )
  }
} 