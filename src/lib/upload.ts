

// 定义上传目录结构
export const UPLOAD_DIRS = {
    // 品牌相关
    BRAND: {
      LOGOS: 'brands/logos',          // 品牌logo
    },
    
    // 产品相关
    PRODUCT: {
      BASE: 'products',
      MAIN: 'main',
      SALES: 'sales',
      DETAILS: 'details',
      GALLERY: 'gallery',
      VIDEOS: 'videos'
    },
    
    // 测评相关
    REVIEW: {
      UNBOXING: 'reviews/unboxing',   // 开箱图片
      CONTENT: 'reviews/content',     // 测评内容图片
    },
    
    // 用户相关
    USER: {
      AVATARS: 'users/avatars',       // 用户头像
    }
  } as const
  
  // 生成文件路径的工具函数
  export function generateUploadPath(
    baseDir: string,
    fileName: string,
    productId?: string
  ): string {
    // 生成唯一文件名
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const ext = fileName.split('.').pop()
    
    // 构建路径
    const parts = [baseDir]
    if (productId) parts.push(productId)
    parts.push(`${uniqueName}.${ext}`)
    
    return parts.join('/')
  }