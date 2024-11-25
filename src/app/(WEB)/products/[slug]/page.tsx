import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ProductBreadcrumb } from "@/components/products/product-breadcrumb"
import { ProductGallery } from "@/components/products/product-gallery"
import { ProductInfo } from "@/components/products/product-info"
import { ProductVideoPlayer } from "@/components/products/product-video-player"

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      productType: true,
      materialType: true,
      channelType: true,
      tags: {
        include: {
          tag: true
        }
      },
      ProductImage: {
        orderBy: {
          sortOrder: 'asc'
        }
      },
      reviews: {
        where: { status: 'PUBLISHED' },
        include: { author: true },
        orderBy: { createdAt: 'desc' }
      },
      ratings: {
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: {
          reviews: true,
          ratings: true
        }
      }
    }
  })

  if (!product) notFound()
  return product
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  
  return (
    <article className="space-y-8">
      {/* 面包屑导航 */}
      <ProductBreadcrumb 
        brand={product.brand}
        productType={product.productType}
        product={product}
      />

      {/* 产品主要信息区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧媒体区域 */}
        <div className="space-y-6">
          {/* 主图和详情图展示 */}
          <ProductGallery 
            mainImage={product.mainImage}
            detailImages={product.detailImages}
          />
          
          {/* 视频播放器 */}
          {product.videoUrl && (
            <ProductVideoPlayer url={product.videoUrl} />
          )}
        </div>

        {/* 右侧产品信息 */}
        <div>
          <ProductInfo 
            product={{
              name: product.name,
              price: product.price,
              description: product.description,
              taobaoUrl: product.taobaoUrl,
              registrationDate: product.registrationDate,
              height: product.height,
              width: product.width,
              length: product.length,
              channelLength: product.channelLength,
              totalLength: product.totalLength,
              weight: product.weight,
              version: product.version,
              isReversible: product.isReversible,
              stimulation: product.stimulation,
              softness: product.softness,
              tightness: product.tightness,
              smell: product.smell as 'NONE' | 'LIGHT' | 'MEDIUM' | 'STRONG',
              oiliness: product.oiliness,
              brand: {
                name: product.brand.name,
                logo: product.brand.logo
              },
              materialType: product.materialType,
              channelType: product.channelType,
              tags: product.tags,
              ratings: {
                average: product.averageRating || 0,
                total: product._count.ratings
              }
            }}
          />
        </div>
      </div>
    </article>
  )
}