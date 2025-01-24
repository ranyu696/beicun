import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { ProductCard } from "@/components/product-card"
import { getProducts } from "@/app/actions/products"
import { ProductStatus } from "@/types/product"

export const metadata: Metadata = {
  title: '产品列表 - 杯村测评',
  description: '探索杯村的所有产品',
}

// 设置重新验证时间
export const revalidate = 60 // 每分钟重新验证一次

export default async function ProductsPage() {
  try {
    console.log('开始获取产品列表...')
    
    const response = await getProducts({
      page: 1,
      pageSize: 100,
      status: 'active'
    })
    
    console.log('获取产品列表成功:', {
      total: response.total,
      listLength: response.list?.length
    })

    const products = response.list || []

    if (products.length === 0) {
      console.log('未找到产品，返回 404')
      notFound()
    }

    console.log('开始渲染产品列表页面')
    return (
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">全部产品</h1>
            <Badge variant="secondary" className="text-base sm:text-lg px-3 py-1">
              共 {products.length} 件
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
              />
            ))}
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('获取产品列表失败:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      timestamp: new Date().toISOString()
    })
    notFound()
  }
}