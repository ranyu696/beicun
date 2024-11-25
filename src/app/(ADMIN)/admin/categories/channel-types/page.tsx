import { Metadata } from "next"
import { ChannelTypeList } from "@/components/admin/categories/channel-types/ChannelTypeList"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export const metadata: Metadata = {
  title: "通道类型管理 - 后台管理",
  description: "管理通道类型",
}

export default function ChannelTypesPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">通道类型管理</h2>
        <Link href="/admin/categories/channel-types/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新增类型
          </Button>
        </Link>
      </div>

      <ChannelTypeList />
    </div>
  )
}