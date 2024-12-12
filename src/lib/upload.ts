export const UPLOAD_DIRS = {
  EDITOR: 'editor',//编辑器
  BRAND: {
    LOGOS: 'brands/logos'//品牌logo
  },
  UTILITY_TYPE: {
    ICONS: 'utility-types/icons'//工具类型图标
  },
  PRODUCT: {
    BASE: 'products',//产品
    MAIN: 'main',//产品主图
    SALES: 'sales',//销售图
    DETAILS: 'details',//产品详情
    GALLERY: 'gallery',//产品图库
    VIDEOS: 'videos'//产品视频
  },
  USER: {
    AVATARS: 'users/avatars'//头像
  }
} as const

export function generateUploadPath(baseDir: string, fileName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = fileName.split('.').pop()
  return `${baseDir}/${timestamp}-${random}.${ext}`
}

export function getFileType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp']
  if (imageTypes.includes(ext)) return 'image'
  const videoTypes = ['mp4', 'webm', 'ogg']
  if (videoTypes.includes(ext)) return 'video'
  return 'other'
}

export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize
}

export function validateFileType(fileName: string, allowedTypes: string[]): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  return allowedTypes.includes(ext)
}