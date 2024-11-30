import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type Params = Promise<{ slug: string }>
export default async function ContentPage({ params }: { params: Params }) {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      description: true,
      ProductImage: {
        orderBy: {
          sortOrder: 'asc'
        }
      }
    }
  })

  if (!product) notFound()

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
          <CardTitle>详细介绍</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {product.ProductImage.map((image, index) => (
              <div key={image.id} className="space-y-4">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={image.imageUrl}
                    alt={image.description || `产品图片 ${index + 1}`}
                    fill
                    className="object-contain"
                  />
                </div>
                {image.description && (
                  <div className="prose prose-sm max-w-none">
                    {image.description}
                  </div>
                )}
                {index < product.ProductImage.length - 1 && (
                  <Separator className="my-8" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}