import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Product } from "@/types/product"

interface BrandCardProps {
  brand: {
    id: string
    name: string
    logo: string
    description: string | null
    productCount: number
    products?: Product[]
  }
}

export function BrandCard({ brand }: BrandCardProps) {
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_DOMAIN || ''

  return (
    <Link href={`/brands/${brand.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="space-y-4">
          {/* 品牌 Logo */}
          <div className="relative h-16 w-full">
            {brand.logo && (
              <Image
                src={`${imageBaseUrl}${brand.logo}`}
                alt={brand.name}
                fill
                className="object-contain"
              />
            )}
          </div>

          {/* 品牌信息 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">{brand.name}</h3>
              <Badge variant="secondary">
                {brand.productCount} 款产品
              </Badge>
            </div>
            {brand.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {brand.description}
              </p>
            )}
          </div>
        </CardHeader>

        {/* 品牌产品展示 */}
        {brand.products && brand.products.length > 0 && (
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {brand.products.slice(0, 4).map((product) => (
                <div 
                  key={product.id}
                  className="relative aspect-square rounded-md overflow-hidden bg-muted"
                >
                  <Image
                    src={`${imageBaseUrl}${product.mainImage?.[0]?.url || ''}`}
                    alt={product.name}
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  )
}