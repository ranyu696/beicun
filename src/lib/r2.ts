import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { 
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand
} from '@aws-sdk/client-s3'

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

// 添加分片上传相关的类型定义
interface UploadPart {
  ETag: string;
  PartNumber: number;
}

interface MultipartUpload {
  uploadId: string;
  parts: UploadPart[];
}

// 添加上传结果���型定义
interface UploadPartResult {
  ETag?: string;
}

// 存储正在进行的分片上传
const activeUploads = new Map<string, MultipartUpload>()

// 创建分片上传任务
export async function createMultipartUpload(key: string) {
  try {
    const command = new CreateMultipartUploadCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: 'video/mp4'
    })
    const response = await s3Client.send(command)
    const uploadId = response.UploadId!

    // 保存上传信息
    activeUploads.set(key, {
      uploadId,
      parts: []
    })

    return { uploadId }
  } catch (error) {
    console.error('创建分片上传失败:', error)
    throw error
  }
}

// 上传分片
export async function uploadR2Object(
  buffer: Buffer, 
  key: string, 
  contentType: string,
  options?: { uploadId?: string; partNumber?: number }
): Promise<UploadPartResult> {
  if (options?.uploadId) {
    try {
      const command = new UploadPartCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        UploadId: options.uploadId,
        PartNumber: options.partNumber,
        Body: buffer
      })
      const response = await s3Client.send(command)
      
      // 保存分片信息
      const upload = activeUploads.get(key)
      if (upload && response.ETag) {
        upload.parts.push({
          ETag: response.ETag,
          PartNumber: options.partNumber!
        })
        activeUploads.set(key, upload)
      }

      return { ETag: response.ETag }
    } catch (error) {
      console.error('上传分片失败:', error)
      throw error
    }
  }

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })

    await s3Client.send(command)
    return {} // 返回空对象而不是 true
  } catch (error) {
    console.error("上传文件失败:", error)
    throw error
  }
}

// 完成分片上传
export async function completeMultipartUpload(key: string, uploadId: string) {
  try {
    const upload = activeUploads.get(key)
    if (!upload) {
      throw new Error('找不到上传任务')
    }

    // 确保分片按顺序排列
    const sortedParts = upload.parts.sort((a, b) => a.PartNumber - b.PartNumber)

    const command = new CompleteMultipartUploadCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: sortedParts
      }
    })

    const result = await s3Client.send(command)
    
    // 清理上传信息
    activeUploads.delete(key)
    
    return result
  } catch (error) {
    console.error('完成分片上传失败:', error)
    throw error
  }
}

// 中止分片上传
export async function abortMultipartUpload(key: string, uploadId: string) {
  try {
    const command = new AbortMultipartUploadCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      UploadId: uploadId
    })
    await s3Client.send(command)
    activeUploads.delete(key)
  } catch (error) {
    console.error('中止分片上传失败:', error)
    throw error
  }
}

// 删除文件夹及其内容
export async function deleteR2Folder(folderPath: string): Promise<boolean> {
  try {
    // 确保文件夹路径以 / 结尾
    const prefix = folderPath.endsWith('/') ? folderPath : `${folderPath}/`

    // 列出文件夹下所有对象
    const { objects } = await listR2Objects({
      prefix,
      maxKeys: 1000, // 设置较大的值以便一次性获取所有文件
    })

    if (objects.length === 0) {
      return true
    }

    // 批量删除所有对象
    const deletePromises = objects.map(obj => 
      deleteR2Object(obj.key)
    )

    // 等待所有删除操作完成
    await Promise.all(deletePromises)

    // 最后删除文件夹本身
    await deleteR2Object(prefix)

    return true
  } catch (error) {
    console.error("删除文件夹失败:", error)
    throw error
  }
}