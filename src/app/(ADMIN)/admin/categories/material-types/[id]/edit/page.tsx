import { Metadata } from "next"
import { MaterialTypeForm } from "@/components/admin/categories/material-types/MaterialTypeForm"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "编辑材料类型 - 后台管理",
  description: "编辑材料类型信息",
}

type Params = Promise<{ id: string }>

export default async function EditMaterialTypePage({ params }: { params: Params }) {
  const { id } = await params
  const materialType = await prisma.materialType.findUnique({
    where: {
      id
    }
  })

  if (!materialType) {
    notFound()
  }

  // 转换日期为字符串
  const formattedMaterialType = {
    ...materialType,
    createdAt: materialType.createdAt.toISOString(),
    updatedAt: materialType.updatedAt.toISOString()
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">编辑材料类型</h2>
      </div>

      <div className="border-t">
        <div className="max-w-2xl py-6">
          <MaterialTypeForm initialData={formattedMaterialType} />
        </div>
      </div>
    </div>
  )
}