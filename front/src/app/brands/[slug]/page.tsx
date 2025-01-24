import { getBrandBySlug, getBrandProducts } from "@/app/actions/brands"
import { ProductCard } from "@/components/product-card"
import { Separator } from "@/components/ui/separator"
import { Product } from "@/types/product"
import Image from "next/image"
import { notFound } from "next/navigation"

interface Props {
  params: {
    slug: string
  }
}

export default async function BrandPage({ params }: Props) {
  const { slug } = params

  // 并行获取品牌信息和产品列表
  const [brand, productsData] = await Promise.all([
    getBrandBySlug(slug),
    getBrandProducts(slug)
  ])

  if (!brand) notFound()

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 品牌信息 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-gray-50 rounded-lg p-6">
          <div className="relative w-32 h-32 shrink-0 bg-white rounded-lg p-4">
            {brand.logo && (
              <Image
                src={brand.logo}
                alt={brand.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 truncate">{brand.name}</h1>
            <p className="mt-2 text-gray-600">{brand.description}</p>
          </div>
        </div>

        {/* 产品列表 */}
        {productsData?.list && productsData.list.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">品牌产品</h2>
              <span className="text-sm text-gray-500">共 {productsData.total} 件</span>
            </div>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productsData.list.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}