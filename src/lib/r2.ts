import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"

export interface R2Object {
  key: string
  size: number
  lastModified: Date
  url: string
  type: string
  isFolder: boolean
  folder: string
  filename: string
}

export interface ListR2Options {
  prefix?: string
  continuationToken?: string
  maxKeys?: number
  delimiter?: string
  sortBy?: 'name' | 'date'
  sortOrder?: 'asc' | 'desc'
}

export interface ListR2Result {
  objects: R2Object[]
  folders: string[]
  nextContinuationToken?: string
  isTruncated: boolean
  currentPrefix: string
}

// S3 客户端配置
export const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

// 列出对象 - 完全重写列表逻辑
export async function listR2Objects({
  prefix = "",
  continuationToken,
  maxKeys = 100,
  delimiter = "/",
  sortBy = 'name',
  sortOrder = 'asc'
}: ListR2Options = {}): Promise<ListR2Result> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME!,
      Prefix: prefix,
      Delimiter: delimiter,
      MaxKeys: maxKeys,
      ContinuationToken: continuationToken,
    })

    const response = await s3Client.send(command)
    const objects: R2Object[] = []
    const processedPaths = new Set<string>()

    // 处理文件夹（CommonPrefixes）
    if (response.CommonPrefixes) {
      for (const commonPrefix of response.CommonPrefixes) {
        if (commonPrefix.Prefix) {
          const folderPath = commonPrefix.Prefix
          if (!processedPaths.has(folderPath)) {
            processedPaths.add(folderPath)
            const segments = folderPath.split('/')
            // 移除空字符串
            segments.pop()
            const folderName = segments[segments.length - 1] || '/'
            
            objects.push({
              key: folderPath,
              size: 0,
              lastModified: new Date(),
              url: '',
              type: 'folder',
              isFolder: true,
              folder: segments.slice(0, -1).join('/'),
              filename: folderName
            })
          }
        }
      }
    }

    // 处理文件
    if (response.Contents) {
      for (const content of response.Contents) {
        if (content.Key && !content.Key.endsWith('/') && !processedPaths.has(content.Key)) {
          processedPaths.add(content.Key)
          const segments = content.Key.split('/')
          const filename = segments.pop()!
          
          objects.push({
            key: content.Key,
            size: content.Size || 0,
            lastModified: content.LastModified || new Date(),
            url: `${process.env.R2_PUBLIC_URL}/${content.Key}`,
            type: filename.split('.').pop()?.toLowerCase() || '',
            isFolder: false,
            folder: segments.join('/'),
            filename
          })
        }
      }
    }

    // 排序
    objects.sort((a, b) => {
      // 文件夹始终在前
      if (a.isFolder && !b.isFolder) return -1
      if (!a.isFolder && b.isFolder) return 1

      // 同类型按照选择的字段排序
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? a.lastModified.getTime() - b.lastModified.getTime()
          : b.lastModified.getTime() - a.lastModified.getTime()
      }

      return sortOrder === 'asc'
        ? a.filename.localeCompare(b.filename)
        : b.filename.localeCompare(a.filename)
    })

    return {
      objects,
      folders: Array.from(processedPaths).filter(p => p.endsWith('/')),
      nextContinuationToken: response.NextContinuationToken,
      isTruncated: response.IsTruncated || false,
      currentPrefix: prefix
    }
  } catch (error) {
    console.error("列出R2对象错误:", error)
    throw error
  }
}

// 创建文件夹 - 只创建一个空的文件夹标记
export async function createR2Folder(path: string): Promise<boolean> {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: path,
      Body: '',
      ContentType: 'application/x-directory',
    })

    await s3Client.send(command)
    return true
  } catch (error) {
    console.error("创建文件夹失败:", error)
    throw error
  }
}

// 删除对象
export async function deleteR2Object(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    })

    await s3Client.send(command)
    return true
  } catch (error) {
    console.error("删除对象失败:", error)
    throw error
  }
}

// 上传文件
// 修改上传函数签名
export async function uploadR2Object(
  buffer: Buffer, 
  key: string, 
  contentType: string
): Promise<boolean> {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })

    await s3Client.send(command)
    return true
  } catch (error) {
    console.error("上传文件失败:", error)
    throw error
  }
}