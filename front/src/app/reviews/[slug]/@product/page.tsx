import { getProductByReviewSlug } from "@/app/actions/reviews"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"
import { cn, getImageUrl } from "@/lib/utils"

interface Props {
  params: {
    slug: string
  }
}

export default async function ProductInfo({ params }: Props) {
  const product = await getProductByReviewSlug(params.slug)
  
  if (!product) return null

  // 获取第一张主图的 URL
  const mainImageUrl = product.mainImage?.[0]?.url || ''

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>产品信息</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 产品图片 */}
        <div className="relative aspect-square rounded-lg overflow-hidden">
          <Image
            src={getImageUrl(mainImageUrl)}
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