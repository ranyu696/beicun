import { notFound } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Suspense } from 'react'
import { getProductBySlug } from "@/app/actions/products"

interface ContentPageProps {
  params: {
    slug: string
  }
}

export default async function ContentPage({ params }: ContentPageProps) {
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_DOMAIN || ''

  try {
    const product = await getProductBySlug(params.slug)

    if (!product) {
      notFound()
    }

    return (
      <div className="space-y-6">
        {/* 产品说明 */}
        {product.description && (
          <Card>
            <CardHeader>
              <CardTitle>产品说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {product.description}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 产品图文介绍 */}
        <Card>
          <CardHeader>
            <CardTitle>产品展示</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.productImages?.map((image, index) => (
                <div key={index} className="space-y-2">
                  <div className="relative aspect-video overflow-hidden rounded-lg">
                    <Image
                      src={`${imageBaseUrl}${image.url}`}
                      alt={image.description || `产品图片 ${index + 1}`}
                      width={image.width}
                      height={image.height}
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  {image.description && (
                    <p className="text-sm text-muted-foreground">
                      {image.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('获取产品内容失败:', error)
    notFound()
  }
}