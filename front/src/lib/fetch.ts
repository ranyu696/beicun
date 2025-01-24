'use server'

import { unstable_cache } from 'next/cache'
import { headers } from 'next/headers'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

interface FetchOptions {
  tags?: string[]
  revalidate?: number
  cache?: boolean
}

// 通用的数据获取函数
export async function fetchData<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { tags = [], revalidate = 60, cache = true } = options

  // 如果需要缓存，使用 unstable_cache
  if (cache) {
    return unstable_cache(
      async () => {
        const response = await fetch(`${API_BASE_URL}${path}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          next: {
            revalidate,
            tags,
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return data.data
      },
      [path],
      {
        tags,
        revalidate,
      }
    )()
  }

  // 如果不需要缓存，直接获取数据
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    next: {
      revalidate: 0,
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  return data.data
}


