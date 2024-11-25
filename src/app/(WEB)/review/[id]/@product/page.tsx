import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

async function getProduct(reviewId: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      product: {
        include: {
          brand: true,        // 包含品牌信息
          materialType: true  // 包含材质信息
        }
      }
    }
  })
  return review?.product
}

export default async function ProductInfo({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)
  
  if (!product) return null

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>产品信息</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 产品图片 */}
        <div className="relative aspect-square rounded-lg overflow-hidden">
          <Image
            src={product.mainImage}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>

        {/* 产品信息 */}
        <div className="space-y-2">
          <Link 
            href={`/products/${product.slug}`}
            className="text-lg font-semibold hover:underline"
          >
            {product.name}
          </Link>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < Math.floor(product.averageRating || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              ({product.totalRatings || 0}个评分)
            </div>
          </div>

          {/* 产品基本信息 */}
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">品牌</span>
              <span>{product.brand?.name || '未知'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">材质</span>
              <span>{product.materialType?.name || '未知'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">尺寸</span>
              <span>
                {product.length || 0}×{product.width || 0}×{product.height || 0}mm
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">重量</span>
              <span>{product.weight || 0}g</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}