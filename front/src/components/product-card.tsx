"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Product } from "@/types/product"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  // 使用产品的平均评分
  const avgRating = product.averageRating || 0

  // 获取所有图片
  const images = product.mainImage?.length ? product.mainImage : []
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // 如果不在客户端，返回一个基础版本
  if (!isClient) {
    const defaultImage = images[0] || { url: '/placeholder.png', width: 400, height: 600 }
    return (
      <Link href={`/products/${product.slug}`}>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="p-0">
            <div className="relative aspect-[3/4]">
              <Image
                src={`${process.env.NEXT_PUBLIC_IMAGE_DOMAIN}${defaultImage.url}`}
                alt={product.name}
                width={defaultImage.width}
                height={defaultImage.height}
                className="object-cover"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 25vw"
              />
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span>{product.brand?.name}</span>
            </div>
            <h4 className="font-semibold mb-2">{product.name}</h4>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{avgRating.toFixed(1)}</span>
              {product.totalRatings > 0 && (
                <span className="text-sm text-gray-500">
                  ({product.totalRatings})
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  const currentImage = images[currentImageIndex] || { url: '/placeholder.png', width: 400, height: 600 }

  const nextImage = () => {
    if (images.length <= 1) return
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    if (images.length <= 1) return
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="p-0">
          <div className="relative aspect-[3/4] group">
            <Image
              src={`${process.env.NEXT_PUBLIC_IMAGE_DOMAIN}${currentImage.url}`}
              alt={`${product.name} - 图片 ${currentImageIndex + 1}`}
              width={currentImage.width}
              height={currentImage.height}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover rounded-lg"
              priority
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    prevImage()
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    nextImage()
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentImageIndex(index)
                      }}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        currentImageIndex === index
                          ? "bg-white"
                          : "bg-white/50"
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>{product.brand?.name}</span>
          </div>
          <h4 className="font-semibold mb-2">{product.name}</h4>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{avgRating.toFixed(1)}</span>
            {product.totalRatings > 0 && (
              <span className="text-sm text-gray-500">
                ({product.totalRatings})
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}