import { Metadata } from "next"
import { ProductNewForm } from "@/components/admin/products/ProductNewForm"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = {
  title: "新建产品 - 后台管理",
  description: "添加新产品",
}

export default async function NewProductPage() {
  // 获取所有需要的关联数据
  const [brands, productTypes, utilityTypes, channelTypes, materialTypes, tags] = await Promise.all([
    prisma.brand.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { sortOrder: 'asc' }
    }),
    prisma.productType.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { sortOrder: 'asc' }
    }),
    prisma.utilityType.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { sortOrder: 'asc' }
    }),
    prisma.channelType.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { sortOrder: 'asc' }
    }),
    prisma.materialType.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { sortOrder: 'asc' }
    }),
    prisma.tag.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })
  ])

  const formData = {
    brands,
    productTypes,
    utilityTypes,
    channelTypes,
    materialTypes,
    tags
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductNewForm formData={formData} />
      </div>
    </div>
  )
}