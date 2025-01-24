import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getParameterText } from "@/lib/utils"
import { 
  Ruler, 
  Scale, 
  ThermometerSun,
  Grip,
  Wind,
  Droplets,
  CalendarDays,
  Weight,
  ArrowLeftRight,
  ShoppingCart,
  Box,
  Tag,
  Star 
} from "lucide-react"
import Image from "next/image"

interface ProductInfoProps {
  product: {
    name: string
    price: number
    description: string | null
    taobaoUrl: string | null
    registrationDate: Date
    height: number
    width: number
    length: number
    channelLength: number
    totalLength: number
    weight: number
    version: string
    isReversible: boolean
    stimulation: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA_HIGH'
    softness: 'ULTRA_SOFT' | 'SOFT' | 'MEDIUM' | 'HARD' | 'ULTRA_HARD'
    tightness: 'LOOSE' | 'MEDIUM' | 'TIGHT' | 'ULTRA_TIGHT'
    smell: 'NONE' | 'LIGHT' | 'MEDIUM' | 'STRONG'
    oiliness: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA_HIGH'
    brand: { 
      name: string
      logo: string | null | undefined
    }
    materialType: { name: string }
    channelType: { name: string }
    tags: { tag: { name: string } }[]
    ratings: {
      average: number
      total: number
    }
  }
}

export function ProductInfo({ product }: ProductInfoProps) {
  return (
    <div className="space-y-6">
      {/* 基本信息卡片 */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">{product.name}</h1>
                <div className="flex items-center gap-3 mt-2 text-muted-foreground">
                  {product.brand.logo ? (
                    <div className="relative w-6 h-6 rounded-full overflow-hidden bg-muted">
                      <Image
                        src={product.brand.logo}
                        alt={product.brand.name}
                        fill
                        className="object-cover"
                        sizes="24px"
                      />
                    </div>
                  ) : (
                    <Tag className="h-4 w-4" />
                  )}
                  <span className="font-medium hover:text-primary transition-colors">
                    {product.brand.name}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  ¥{product.price.toFixed(2)}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Star className="h-4 w-4 fill-current" />
                  <span>{product.ratings.average.toFixed(1)}</span>
                  <span>({product.ratings.total})</span>
                </div>
              </div>
            </div>

            {product.taobaoUrl && (
              <Button className="w-full" size="lg" asChild>
                <a href={product.taobaoUrl} target="_blank" rel="noopener noreferrer">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  在淘宝购买
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 产品特性卡片 */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Box className="h-5 w-5" />
            产品特性
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <Scale className="h-5 w-5 text-primary" />
              <span>软硬度: {getParameterText(product.softness as any, 'softness')}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <ThermometerSun className="h-5 w-5 text-primary" />
              <span>刺激度: {getParameterText(product.stimulation as any, 'stimulation')}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <Grip className="h-5 w-5 text-primary" />
              <span>紧致度: {getParameterText(product.tightness as any, 'tightness')}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <Wind className="h-5 w-5 text-primary" />
              <span>气味: {getParameterText(product.smell as any, 'smell')}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <Droplets className="h-5 w-5 text-primary" />
              <span>出油量: {getParameterText(product.oiliness as any, 'oiliness')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 规格信息卡片 */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Box className="h-5 w-5" />
            规格信息
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <Ruler className="h-5 w-5 text-primary" />
              <span>总长: {product.totalLength}mm</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <Weight className="h-5 w-5 text-primary" />
              <span>重量: {product.weight}g</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <CalendarDays className="h-5 w-5 text-primary" />
              <span>发售日期: {new Date(product.registrationDate).toLocaleDateString()}</span>
            </div>
            {product.isReversible && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <ArrowLeftRight className="h-5 w-5 text-primary" />
                <span>可双面使用</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 标签卡片 */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Box className="h-5 w-5" />
            标签
          </h2>
          <div className="flex flex-wrap gap-2">
            {product.tags.map(({ tag }) => (
              <Badge key={tag.name} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}