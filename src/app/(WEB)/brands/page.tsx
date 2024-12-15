import { prisma } from "@/lib/prisma"
import { BrandCard } from "@/components/brands/brand-card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export default async function BrandsPage() {
  // 获取所有启用的品牌,按排序号排序
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: { products: true }
      }
    }
  })

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h1 className="text-3xl font-bold mb-2">品牌分类</h1>
              <p className="text-muted-foreground text-lg">
                探索各大品牌的产品系列,找到适合你的选择
              </p>
            <Badge variant="secondary" className="text-lg px-4 py-2 h-fit">
              {brands.length} 个品牌
            </Badge>
          </div>
        </div>
      </div>
      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand) => (
          <BrandCard
            key={brand.id}
            brand={{
              id: brand.id,
              name: brand.name,
              logo: brand.logo || '',
              description: brand.description,
              productCount: brand._count.products
            }}
          />
        ))}
      </div>
    </div>
  )
} 