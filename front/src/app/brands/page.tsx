import { BrandCard } from "@/components/brands/brand-card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { getBrands } from "@/app/actions/brands"
import { Brand } from "@/types/brand"

export default async function BrandsPage() {
  // 获取所有启用的品牌
  const { list: brands = [] } = await getBrands({  
    sortBy: 'updatedAt',
    sortOrder: 'asc'
  })

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 品牌标题 */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">品牌分类</h1>
              <p className="text-muted-foreground text-lg">
                探索各大品牌的产品系列,找到适合你的选择
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2 h-fit">
              {brands.length} 个品牌
            </Badge>
          </div>
        </div>

        <Separator />
        
        {/* 品牌列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand: Brand) => (
            <BrandCard
              key={brand.id}
              brand={{
                id: brand.id,
                name: brand.name,
                logo: brand.logo || '',
                description: brand.description,
                productCount: 0, // 暂时不显示产品数量
                products: [] // 暂时不显示产品列表
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}