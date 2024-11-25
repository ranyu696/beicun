import { Metadata } from "next"
import { ProductTypeForm } from "@/components/admin/categories/product-types/ProductTypeForm"

export const metadata: Metadata = {
  title: "新增产品类型 - 后台管理",
  description: "创建新的产品类型",
}

export default function NewProductTypePage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">新增产品类型</h2>
      </div>

      <div className="border-t">
        <div className="max-w-2xl py-6">
          <ProductTypeForm />
        </div>
      </div>
    </div>
  )
}