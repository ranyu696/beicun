import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { notFound } from "next/navigation"

async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      include: {
        brand: true,
        productType: true,
        materialType: true,
        ratings: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!products.length) {
      notFound()
    }

    return products
  } catch (error) {
    throw new Error(
      `Failed to fetch products: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export default async function ProductsPage() {
  const products = await getProducts()

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
            <Link 
              key={product.id} 
              href={`/products/${product.slug}`}
              className="group"
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                <CardHeader className="p-0">
                  <div className="aspect-square relative overflow-hidden rounded-t-lg">
                    <Image
                      src={product.mainImage}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      priority
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base sm:text-lg line-clamp-2">
                      {product.name}
                    </CardTitle>
                    {product.isReversible && (
                      <Badge variant="secondary" className="shrink-0">
                        可翻洗
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{product.brand.name}</span>
                    <span>•</span>
                    <span>{product.productType.name}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-lg sm:text-xl font-bold">
                      {formatPrice(product.price)}
                    </div>
                    {product.ratings.length > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-yellow-500">★</span>
                        <span>
                          {(product.ratings.reduce((acc, rating) => acc + rating.rating, 0) / 
                            product.ratings.length).toFixed(1)}
                        </span>
                        <span className="text-muted-foreground">
                          ({product.ratings.length})
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}