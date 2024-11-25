import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import crypto from 'crypto'

const s3Client = new S3Client({
  region: process.env.R2_REGION!,
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: '未找到文件' }, { status: 400 })
    }

    // 验证文件类型
    if (!file.type.startsWith('video/')) {
      return NextResponse.json({ error: '不支持的文件类型' }, { status: 400 })
    }

    // 验证文件大小
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: '文件大小超过限制' }, { status: 400 })
    }

    // 生成唯一文件名
    const fileExt = file.name.split('.').pop()
    const fileName = `videos/${crypto.randomUUID()}.${fileExt}`

    // 上传到 R2
    const buffer = Buffer.from(await file.arrayBuffer())
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    })

    await s3Client.send(command)

    // 生成公开访问 URL
    const url = `${process.env.R2_PUBLIC_URL}/${fileName}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error('视频上传失败:', error)
    return NextResponse.json(
      { error: '视频上传失败' },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}