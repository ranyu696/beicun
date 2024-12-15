import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BrandCardProps {
  brand: {
    id: string
    name: string
    logo: string
    description: string | null
    productCount: number
  }
}

export function BrandCard({ brand }: BrandCardProps) {
  return (
    <Link href={`/brands/${encodeURIComponent(brand.name)}`}>
      <Card className="hover:bg-muted/50 transition-colors">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="relative w-16 h-16">
            <Image
              src={brand.logo}
              alt={brand.name}
              fill
              sizes="64px"
              className="object-contain"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{brand.name}</h3>
            <Badge variant="secondary">
              {brand.productCount} 个产品
            </Badge>
          </div>
        </CardHeader>
        {brand.description && (
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {brand.description}
            </p>
          </CardContent>
        )}
      </Card>
    </Link>
  )
} 