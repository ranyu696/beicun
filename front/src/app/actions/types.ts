'use server'

import { fetchData } from '@/lib/fetch'
import { Type, TypeKind, TypeListParams, TypeListResponse } from '@/types/type'

// 缓存标签
const CACHE_TAGS = {
  types: 'types',
  type: 'type',
}

// 获取类型列表
export async function getTypes(kind: TypeKind, params?: TypeListParams) {
  const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : ''
  return fetchData<TypeListResponse>(`/${kind}-types${queryString}`, {
    tags: [CACHE_TAGS.types, kind],
    revalidate: 60,
  })
}

// 获取类型详情
export async function getType(kind: TypeKind, id: string) {
  return fetchData<Type>(`/${kind}-types/${id}`, {
    tags: [CACHE_TAGS.type, kind],
    revalidate: 60,
  })
}
