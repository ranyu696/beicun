import { UtilityTypeForm } from "@/components/admin/categories/utility-types/utility-type-form"
import { Metadata } from "next"



export const metadata: Metadata = {
  title: "新增产品类型 - 后台管理",
  description: "创建新的产品类型",
}

export default async function UtilityTypePage() {

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <UtilityTypeForm/>
      </div>
    </div>
  )
} 