import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

interface PageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: PageProps) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      brand: true,
      productType: true,
      channelType: true,
      materialType: true,
      ProductImage: true,
      tags: {
        include: {
          tag: true
        }
      }
    }
  })

  if (!product) {
    notFound()
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">产品详情</h1>
        <Link href={`/admin/products/${product.id}/edit`}>
          <Button>编辑产品</Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {/* 基本信息 */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">基本信息</h2>
          <div className="grid gap-4">
            <div>
              <span className="font-medium">产品名称：</span>
              {product.name}
            </div>
            <div>
              <span className="font-medium">URL标识：</span>
              {product.slug}
            </div>
            <div>
              <span className="font-medium">价格：</span>
              ¥{product.price}
            </div>
            <div>
              <span className="font-medium">品牌：</span>
              {product.brand.name}
            </div>
            <div>
              <span className="font-medium">产品类型：</span>
              {product.productType.name}
            </div>
            <div>
              <span className="font-medium">通道类型：</span>
              {product.channelType.name}
            </div>
            <div>
              <span className="font-medium">材料类型：</span>
              {product.materialType.name}
            </div>
            {product.description && (
              <div>
                <span className="font-medium">产品描述：</span>
                {product.description}
              </div>
            )}
          </div>
        </div>

        {/* 规格参数 */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">规格参数</h2>
          <div className="grid gap-4">
            <div>
              <span className="font-medium">注册日期：</span>
              {new Date(product.registrationDate).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">尺寸：</span>
              {product.length} × {product.width} × {product.height} mm
            </div>
            <div>
              <span className="font-medium">通道长度：</span>
              {product.channelLength} mm
            </div>
            <div>
              <span className="font-medium">总长度：</span>
              {product.totalLength} mm
            </div>
            <div>
              <span className="font-medium">重量：</span>
              {product.weight} g
            </div>
            <div>
              <span className="font-medium">版本：</span>
              {product.version}
            </div>
            <div>
              <span className="font-medium">可翻洗：</span>
              {product.isReversible ? '是' : '否'}
            </div>
          </div>
        </div>

        {/* 产品特性 */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">产品特性</h2>
          <div className="grid gap-4">
            <div>
              <span className="font-medium">刺激度：</span>
              {product.stimulation}
            </div>
            <div>
              <span className="font-medium">软硬度：</span>
              {product.softness}
            </div>
            <div>
              <span className="font-medium">紧致度：</span>
              {product.tightness}
            </div>
            <div>
              <span className="font-medium">气味度：</span>
              {product.smell}
            </div>
            <div>
              <span className="font-medium">出油量：</span>
              {product.oiliness}
            </div>
          </div>
        </div>

        {/* 标签 */}
        {product.tags.length > 0 && (
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">标签</h2>
            <div className="flex flex-wrap gap-2">
              {product.tags.map(({ tag }) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}