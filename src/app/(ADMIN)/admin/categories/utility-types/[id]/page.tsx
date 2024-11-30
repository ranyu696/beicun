import { prisma } from "@/lib/prisma"
import { UtilityTypeForm } from "@/components/admin/categories/utility-types/utility-type-form"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "编辑器具类型 - 后台管理",
  description: "编辑器具类型信息",
}

type Params = Promise<{ id: string }>

export default async function UtilityTypePage({ params }: { params: Params }) {
  const { id } = await params
  const utilityType = await prisma.utilityType.findUnique({
    where: {
      id
    }
  })

  // 如果找不到器具类型，返回404页面
  if (!utilityType) {
    notFound()
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <UtilityTypeForm initialData={utilityType} />
      </div>
    </div>
  )
} 