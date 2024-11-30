import { Metadata } from "next"
import { ProductTypeForm } from "@/components/admin/categories/product-types/ProductTypeForm"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "编辑产品类型 - 后台管理",
  description: "编辑产品类型信息",
}

type Params = Promise<{ id: string }>

export default async function EditProductTypePage({ params }: { params: Params }) {
  const { id } = await params
  const productType = await prisma.productType.findUnique({
    where: {
      id
    }
  })

  if (!productType) {
    notFound()
  }

  // 转换日期为字符串
  const formattedProductType = {
    ...productType,
    createdAt: productType.createdAt.toISOString(),
    updatedAt: productType.updatedAt.toISOString()
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">编辑产品类型</h2>
      </div>

      <div className="border-t">
        <div className="max-w-2xl py-6">
          <ProductTypeForm initialData={formattedProductType} />
        </div>
      </div>
    </div>
  )
}