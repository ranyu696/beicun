import { notFound } from 'next/navigation'
import { ProductEditForm } from '@/components/admin/products/ProductEditForm'
import { prisma } from '@/lib/prisma'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type Params = Promise<{ id: string }>

export default async function EditProductPage({ params }: { params: Params }) {
  const { id } = await params

  // 获取所有需要的数据
  const [
    product,
    brands,
    productTypes,
    channelTypes,
    materialTypes,
    utilityTypes,
    tags
  ] = await Promise.all([
    // 获取产品数据
    prisma.product.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    }),
    // 获取品牌列表
    prisma.brand.findMany(),
    // 获取产品类型列表
    prisma.productType.findMany(),
    // 获取通道类型列表
    prisma.channelType.findMany(),
    // 获取材料类型列表
    prisma.materialType.findMany(),
    // 获取用途类型列表
    prisma.utilityType.findMany(),
    // 获取标签列表
    prisma.tag.findMany()
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/products">
              <Button
                variant="ghost"
                size="icon"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Heading
              title="编辑产品"
              description={`编辑 ${product.name} 的基本信息`}
            />
          </div>
        </div>
        <Separator />
        
        <ProductEditForm 
          productData={product}
          brands={brands}
          productTypes={productTypes}
          channelTypes={channelTypes}
          materialTypes={materialTypes}
          utilityTypes={utilityTypes}
          tags={tags}
        />
      </div>
    </div>
  )
}