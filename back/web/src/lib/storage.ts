/**
 * 获取完整的存储文件 URL
 * @param path 文件路径
 * @returns 完整的 URL
 */
export function getStorageUrl(path: string | undefined | null): string {
  if (!path) return ''
  
  // 如果已经是完整的 URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  // 如果已经包含 /storage 前缀，直接返回
  if (path.startsWith('/storage/')) {
    return path
  }
  
  // 添加 /storage 前缀
  return path.startsWith('/') ? `/storage${path}` : `/storage/${path}`
}
