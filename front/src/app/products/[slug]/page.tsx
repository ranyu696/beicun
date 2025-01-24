import { notFound } from "next/navigation"
import { Metadata } from "next"
import { getProductBySlug } from "@/app/actions/products"
import { ProductBreadcrumb } from "@/components/products/product-breadcrumb"
import { ProductGallery } from "@/components/products/product-gallery"
import { ProductInfo } from "@/components/products/product-info"
import { ProductVideoPlayer } from "@/components/products/product-video-player"
import { Level } from "@/types/product"

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

// 动态生成元数据
export async function generateMetadata(props: ProductPageProps): Promise<Metadata> {
  try {
    const params = await props.params
    const product = await getProductBySlug(params.slug)
    return {
      title: `${product.name} - 杯村测评`,
      description: product.description || `${product.name}的详细信息和测评`,
    }
  } catch (error) {
    return {
      title: '产品详情 - 杯村测评',
      description: '产品的详细信息和测评',
    }
  }
}

// 设置重新验证时间
export const revalidate = 60 // 每分钟重新验证一次

export default async function ProductPage(props: ProductPageProps) {
  try {
    const params = await props.params
    console.log('开始获取产品详情...', { slug: params.slug })
    
    const product = await getProductBySlug(params.slug)
    
    console.log('获取产品详情成功:', {
      id: product.id,
      name: product.name,
      slug: product.slug
    })

    if (!product) {
      console.log('未找到产品，返回 404')
      notFound()
    }

    // 准备主图和详情图
    const mainImage = product.mainImage?.[0]
    const detailImages = [
      ...(product.mainImage || []),
      ...(product.salesImage || []),
      ...(product.productImages || [])
    ].sort((a, b) => a.sort - b.sort) // 按照 sort 字段排序

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
              mainImage={mainImage}
              detailImages={detailImages}
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
                description: product.description || null,
                taobaoUrl: product.taobaoUrl || null,
                registrationDate: new Date(product.registrationDate),
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
                smell: product.smell === Level.LOW ? 'LIGHT' 
                  : product.smell === Level.HIGH ? 'STRONG'
                  : product.smell === Level.MEDIUM ? 'MEDIUM'
                  : 'NONE',
                oiliness: product.oiliness,
                brand: {
                  name: product.brand.name,
                  logo: null // 如果没有 logo 字段，设为 null
                },
                materialType: product.materialType,
                channelType: product.channelType,
                tags: product.tags?.map(tag => ({ tag: { name: tag.tagId } })) || [],
                ratings: {
                  average: product.averageRating || 0,
                  total: product.totalRatings || 0
                }
              }}
            />
          </div>
        </div>
      </article>
    )
  } catch (error) {
    const params = await props.params
    console.error('获取产品详情失败:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      slug: params.slug,
      timestamp: new Date().toISOString()
    })
    notFound()
  }
}