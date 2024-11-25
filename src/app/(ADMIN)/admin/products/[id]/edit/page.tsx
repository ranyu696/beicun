import { notFound } from 'next/navigation'
import { ProductForm } from '@/components/admin/products/ProductForm'
import { prisma } from '@/lib/prisma'
import { ProductModel } from '@/types/product'
import { Product, ProductImage, ProductTag, Tag } from '@prisma/client'

interface PageProps {
  params: {
    id: string
  }
}

interface ProductWithRelations extends Product {
  ProductImage: ProductImage[]
  tags: (ProductTag & { tag: Tag })[]
}

export default async function EditProductPage({ params }: PageProps) {
  // 获取产品数据
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      ProductImage: {
        orderBy: {
          sortOrder: 'asc'
        }
      },
      tags: {
        include: {
          tag: true
        }
      }
    }
  }) as ProductWithRelations | null

  if (!product) {
    notFound()
  }

  // 转换数据以匹配 ProductModel 接口
  const transformedProduct: ProductModel = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    brandId: product.brandId,
    productTypeId: product.productTypeId,
    channelTypeId: product.channelTypeId,
    materialTypeId: product.materialTypeId,
    description: product.description || undefined,
    taobaoUrl: product.taobaoUrl || undefined,
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
    smell: product.smell,
    oiliness: product.oiliness,
    mainImage: product.mainImage,
    salesImage: product.salesImage,
    videoUrl: product.videoUrl || undefined,
    detailImages: product.detailImages || [],
    ProductImage: product.ProductImage.map((img: ProductImage) => ({
      id: img.id,
      imageUrl: img.imageUrl,
      sortOrder: img.sortOrder
    })),
    tags: product.tags.map((productTag) => ({
      id: `${productTag.productId}_${productTag.tagId}`, // 使用复合主键
      tagId: productTag.tagId
    }))
  }

  // 获取表单所需的选项数据
  const [brands, productTypes, channelTypes, materialTypes, tags] = await Promise.all([
    prisma.brand.findMany({
      orderBy: { sortOrder: 'asc' }
    }),
    prisma.productType.findMany({
      orderBy: { sortOrder: 'asc' }
    }),
    prisma.channelType.findMany({
      orderBy: { sortOrder: 'asc' }
    }),
    prisma.materialType.findMany({
      orderBy: { sortOrder: 'asc' }
    }),
    prisma.tag.findMany({
      orderBy: { name: 'asc' }
    })
  ])

  const formData = {
    brands,
    productTypes,
    channelTypes,
    materialTypes,
    tags
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">编辑产品 - {product.name}</h1>
      </div>
      
      <ProductForm 
        initialData={transformedProduct}
        formData={formData}
      />
    </div>
  )
}