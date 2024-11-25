import { Metadata } from "next"
import { BrandForm } from "@/components/admin/brands/BrandForm"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "编辑品牌 - 后台管理",
  description: "编辑品牌信息",
}


type Params = Promise<{ id: string }>

export default async function EditBrandPage({ params }: { params: Params }) {
  // 获取品牌信息
  const { id } = await params
  const brand = await prisma.brand.findUnique({
    where: {
      id
    }
  })

  if (!brand) {
    notFound()
  }

  // 转换日期为字符串
  const formattedBrand = {
    ...brand,
    createdAt: brand.createdAt.toISOString(),
    updatedAt: brand.updatedAt.toISOString()
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">编辑品牌</h2>
      </div>

      <div className="border-t">
        <div className="max-w-2xl py-6">
          <BrandForm initialData={formattedBrand} />
        </div>
      </div>
    </div>
  )
}