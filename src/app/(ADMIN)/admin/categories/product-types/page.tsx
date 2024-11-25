import { Metadata } from "next"
import { ProductTypeList } from "@/components/admin/categories/product-types/ProductTypeList"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export const metadata: Metadata = {
  title: "产品类型管理 - 后台管理",
  description: "管理产品类型",
}

export default function ProductTypesPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">产品类型管理</h2>
        <Link href="/admin/categories/product-types/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新增类型
          </Button>
        </Link>
      </div>

      <ProductTypeList />
    </div>
  )
}