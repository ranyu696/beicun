import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

type BrandProps = {
  brand: {
    id: string
    name: string
    logo: string | null
    description: string | null
  }
}

export function BrandCard({ brand }: BrandProps) {
  const logoUrl = brand.logo 
    ? `${process.env.NEXT_PUBLIC_IMAGE_DOMAIN}${brand.logo}`
    : null

  return (
    <Link href={`/brands/${brand.name}`}>
      <Card className="text-center hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="mb-4 inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-50">
            {logoUrl ? (
              <Image 
                src={logoUrl} 
                alt={brand.name} 
                width={80}
                height={80}
                className="w-20 h-20 object-contain"
              />
            ) : (
              <div className="text-2xl font-bold text-gray-400">
                {brand.name[0]}
              </div>
            )}
          </div>
          <h4 className="font-semibold">{brand.name}</h4>
          {brand.description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {brand.description}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
} 