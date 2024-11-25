import { Metadata } from "next"
import { ProductForm } from "@/components/admin/products/ProductForm"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const metadata: Metadata = {
  title: "新增产品 - 后台管理",
  description: "创建新产品",
}

// 获取所需的基础数据
async function getFormData() {
  const [brands, productTypes, channelTypes, materialTypes, tags] = await Promise.all([
    prisma.brand.findMany({
      orderBy: { name: 'asc' }
    }),
    prisma.productType.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    }),
    prisma.channelType.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    }),
    prisma.materialType.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    }),
    prisma.tag.findMany({
      orderBy: { name: 'asc' }
    })
  ])

  return {
    brands,
    productTypes,
    channelTypes,
    materialTypes,
    tags
  }
}

export default async function NewProductPage() {
  // 验证权限
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/login')
  }

  // 获取表单所需数据
  const formData = await getFormData()

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">产品管理</h2>
      </div>

      {/* 分割线 */}
      <div className="h-[1px] bg-border" />

      {/* 产品表单 */}
      <ProductForm formData={formData} />
    </div>
  )
}