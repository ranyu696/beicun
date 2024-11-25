import { Metadata } from "next"
import { MaterialTypeList } from "@/components/admin/categories/material-types/MaterialTypeList"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export const metadata: Metadata = {
  title: "材料类型管理 - 后台管理",
  description: "管理材料类型",
}

export default function MaterialTypesPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">材料类型管理</h2>
        <Link href="/admin/categories/material-types/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新增类型
          </Button>
        </Link>
      </div>

      <MaterialTypeList />
    </div>
  )
}