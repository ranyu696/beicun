import { prisma } from "@/lib/prisma"
import { ProductMediaUploader } from "@/components/admin/products/ProductMediaUploader"
import { notFound } from "next/navigation"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"




type Params = Promise<{ id: string }>

  
export default async function MediaPage({ params }: { params: Params }) {
 
  // 获取产品信息
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: {id},
    select: {
      id: true,
      name: true,
      mainImage: true,
      salesImage: true,
      videoUrl: true,
      detailImages: true,
      ProductImage: {
        select: {
          id: true,
          imageUrl: true,
          description: true,
          sortOrder: true,
        },
        orderBy: {
          sortOrder: 'asc'
        }
      }
    }
  })

  console.log('Product data:', product)

  if (!product) {
    notFound()
  }


  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/admin/products`}>
              <Button
                variant="ghost"
                size="icon"
              >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            </Link>
            <Heading
              title="产品媒体资源"
              description={`编辑 ${product.name} 的媒体资源`}
            />
          </div>
        </div>
        <Separator />
        
        <ProductMediaUploader
          productId={product.id}
          productData={product}
        />
      </div>
    </div>
  )
}

