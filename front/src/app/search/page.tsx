import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/product-card"
import { Separator } from "@/components/ui/separator"
import { ProductFilters } from "@/components/search/product-filters"
import { ProductSort } from "@/components/search/product-sort"
import { Prisma } from "@prisma/client"
import { Pagination } from "@/components/pagination"

type SearchParams = Promise<{
  [key: string]: string | string[] | undefined
}>

interface PageProps {
  searchParams: SearchParams
}

export default async function SearchPage(props: PageProps) {
  const searchParams = await props.searchParams
  
  // 处理搜索参数
  const q = typeof searchParams.q === 'string' ? searchParams.q : ""
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : "newest"
  const brand = typeof searchParams.brand === 'string' ? searchParams.brand : undefined
  const type = typeof searchParams.type === 'string' ? searchParams.type : undefined
  const material = typeof searchParams.material === 'string' ? searchParams.material : undefined
  const channel = typeof searchParams.channel === 'string' ? searchParams.channel : undefined
  const utility = typeof searchParams.utility === 'string' ? searchParams.utility : undefined
  const minPrice = typeof searchParams.minPrice === 'string' ? searchParams.minPrice : undefined
  const maxPrice = typeof searchParams.maxPrice === 'string' ? searchParams.maxPrice : undefined
  const page = typeof searchParams.page === 'string' ? searchParams.page : "1"

  // 构建查询条件
  const where = {
    AND: [
      q ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } }
        ]
      } : {},
      brand ? { brandId: brand } : {},
      type ? { productTypeId: type } : {},
      material ? { materialTypeId: material } : {},
      channel ? { channelTypeId: channel } : {},
      utility ? { utilityTypeId: utility } : {},
      minPrice ? { price: { gte: parseFloat(minPrice) } } : {},
      maxPrice ? { price: { lte: parseFloat(maxPrice) } } : {}
    ].filter(condition => Object.keys(condition).length > 0)
  }

  // 构建排序条件
  const orderBy: Prisma.ProductOrderByWithRelationInput = (() => {
    switch (sort) {
      case 'newest':
        return { createdAt: 'desc' }
      case 'priceAsc':
        return { price: 'asc' }
      case 'priceDesc':
        return { price: 'desc' }
      case 'nameAsc':
        return { name: 'asc' }
      case 'nameDesc':
        return { name: 'desc' }
      default:
        return { createdAt: 'desc' }
    }
  })()

  // 分页
  const pageSize = 24
  const pageNumber = parseInt(page)
  const skip = (pageNumber - 1) * pageSize

  // 获取数据
  const [products, total, filters] = await Promise.all([
    // 获取产品列表
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        brand: true,
        productType: true,
        ratings: true,
        _count: {
          select: {
            ratings: true,
            reviews: true
          }
        }
      }
    }),
    // 获取总数
    prisma.product.count({ where }),
    // 获取筛选项
    prisma.$transaction([
      prisma.brand.findMany({ 
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      }),
      prisma.productType.findMany({ 
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      }),
      prisma.materialType.findMany({ 
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      }),
      prisma.channelType.findMany({ 
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      }),
      prisma.utilityType.findMany({ 
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      })
    ])
  ])

  const [brands, types, materials, channels, utilities] = filters

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 搜索结果标 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">
            {q ? `"${q}" 的搜索结果` : '所有产品'}
          </h1>
          <span className="text-muted-foreground">
            共 {total} 件商品
          </span>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 筛选器 */}
          <div className="w-full lg:w-64 shrink-0 space-y-4">
            <div className="sticky top-20">
              <ProductFilters
                brands={brands}
                types={types}
                materials={materials}
                channels={channels}
                utilities={utilities}
                selectedFilters={{
                  brand,
                  type,
                  material,
                  channel,
                  utility,
                  minPrice,
                  maxPrice
                }}
              />
            </div>
          </div>

          {/* 产品列表 */}
          <div className="flex-1 space-y-6">
            {/* 排序 */}
            <div className="flex items-center justify-between">
              <ProductSort sort={sort} />
            </div>

            {/* 产品网格 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>

            {/* 无结果 */}
            {products.length === 0 && (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">
                  没有找到相关产品
                </p>
              </div>
            )}

            {/* 分页 */}
            {total > pageSize && (
              <div className="flex justify-center pt-6">
                <Pagination
                  total={total}
                  pageSize={pageSize}
                  currentPage={pageNumber}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 