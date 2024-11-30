export const UPLOAD_DIRS = {
  EDITOR: 'editor',
  BRAND: {
    LOGOS: 'brands/logos'
  },
  UTILITY_TYPE: {
    ICONS: 'utility-types/icons'
  },
  PRODUCT: {
    BASE: 'products',
    MAIN: 'main',
    SALES: 'sales',
    DETAILS: 'details',
    GALLERY: 'gallery',
    VIDEOS: 'videos'
  },
  REVIEW: {
    UNBOXING: 'reviews/unboxing',
    CONTENT: 'reviews/content'
  },
  USER: {
    AVATARS: 'users/avatars'
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