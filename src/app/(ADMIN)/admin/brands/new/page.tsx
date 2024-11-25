import { Metadata } from "next"
import { BrandForm } from "@/components/admin/brands/BrandForm"

export const metadata: Metadata = {
  title: "新增品牌 - 后台管理",
  description: "创建新的品牌",
}

export default function NewBrandPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">新增品牌</h2>
      </div>

      <div className="border-t">
        <div className="max-w-2xl py-6">
          <BrandForm />
        </div>
      </div>
    </div>
  )
}