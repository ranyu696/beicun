import { UPLOAD_DIRS, generateUploadPath } from '@/lib/upload'

export async function uploadFile(file: File, type: string, productId?: string) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  if (productId) {
    formData.append('productId', productId)
  }

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error('上传失败')
  }

  const data = await response.json()
  return data.url
} 