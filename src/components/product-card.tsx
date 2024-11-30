import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Product, Brand, ProductRating } from "@prisma/client"

interface ProductCardProps {
  product: Product & {
    brand: Brand
    ratings: ProductRating[]
  }
}

export function ProductCard({ product }: ProductCardProps) {
  // 计算平均评分
  const avgRating = product.ratings.length > 0
    ? product.ratings.reduce((acc: number, rating) => acc + rating.rating, 0) / product.ratings.length
    : 0;

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="p-0">
          <div className="aspect-square relative">
            <Image
              src={product.mainImage}
              alt={product.name}
              fill
              className="object-cover rounded-t-lg"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>{product.brand.name}</span>
          </div>
          <h4 className="font-semibold mb-2">{product.name}</h4>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{avgRating.toFixed(1)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
} 