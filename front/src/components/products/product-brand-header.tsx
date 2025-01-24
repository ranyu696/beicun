import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"
import React from "react"

interface ProductBrandHeaderProps {
  brand: {
    id: string
    name: string
    logo: string | null
    description: string | null
    website: string | null
  }
}

export function ProductBrandHeader({ brand }: ProductBrandHeaderProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        {/* 品牌Logo */}
        {brand.logo && (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
            <Image
              src={brand.logo}
              alt={brand.name}
              fill
              className="object-contain"
            />
          </div>
        )}

        {/* 品牌信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold truncate">
              {brand.name}
            </h2>
            {brand.website && (
              <Link
                href={brand.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            )}
          </div>
          {brand.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {brand.description}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}