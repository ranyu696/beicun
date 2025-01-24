

interface GetCommentsParams {
  reviewSlug: string
  page?: number
  pageSize?: number
  status?: string
}

// 获取评论列表
export async function getComments({ reviewSlug, page = 1, pageSize = 10, status }: GetCommentsParams) {
  try {
    const searchParams = new URLSearchParams({
      review_slug: reviewSlug,
      page: String(page),
      pageSize: String(pageSize),
    })

    if (status) {
      searchParams.append('status', status)
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!res.ok) {
      throw new Error('获取评论列表失败')
    }

    const data = await res.json()
    return {
      list: data.data,
      total: data.total,
      totalPages: Math.ceil(data.total / pageSize)
    }
  } catch (error) {
    console.error('获取评论列表失败:', error)
    throw error
  }
}
