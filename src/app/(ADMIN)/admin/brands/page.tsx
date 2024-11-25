import { Metadata } from "next"
import { BrandList } from "@/components/admin/brands/BrandList"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export const metadata: Metadata = {
  title: "品牌管理 - 后台管理",
  description: "管理品牌",
}

export default function BrandsPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">品牌管理</h2>
        <Link href="/admin/brands/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新增品牌
          </Button>
        </Link>
      </div>

      <BrandList />
    </div>
  )
}