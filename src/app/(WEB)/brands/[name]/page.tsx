import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ProductCard } from "@/components/product-card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

type Params = Promise<{ name: string }>

export default async function BrandPage({ params }: { params: Params }) {
  const { name } = await params
  const decodedName = decodeURIComponent(name)

  // 获取品牌信息和产品列表
  const brand = await prisma.brand.findFirst({
    where: { 
      name: decodedName,
      isActive: true 
    },
    include: {
      products: {
        orderBy: { 
          createdAt: 'desc' 
        },
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
      }
    }
  })

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
                sizes="128px"
                className="object-contain"
              />
            )}
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {brand.name}
            </h1>
            {brand.description && (
              <p className="text-muted-foreground max-w-2xl">
                {brand.description}
              </p>
            )}
          </div>
        </div>
        
        <Separator className="my-8" />

        {/* 产品列表 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              全部产品
            </h2>
            <span className="text-muted-foreground">
              共 {brand.products.length} 件
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {brand.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 