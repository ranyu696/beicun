import { Metadata } from "next"
import { MaterialTypeForm } from "@/components/admin/categories/material-types/MaterialTypeForm"

export const metadata: Metadata = {
  title: "新增材料类型 - 后台管理",
  description: "创建新的材料类型",
}

export default function NewMaterialTypePage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">新增材料类型</h2>
      </div>

      <div className="border-t">
        <div className="max-w-2xl py-6">
          <MaterialTypeForm />
        </div>
      </div>
    </div>
  )
}