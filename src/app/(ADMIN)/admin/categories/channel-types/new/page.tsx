import { Metadata } from "next"
import { ChannelTypeForm } from "@/components/admin/categories/channel-types/ChannelTypeForm"

export const metadata: Metadata = {
  title: "新增通道类型 - 后台管理",
  description: "创建新的通道类型",
}

export default function NewChannelTypePage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">新增通道类型</h2>
      </div>

      <div className="border-t">
        <div className="max-w-2xl py-6">
          <ChannelTypeForm />
        </div>
      </div>
    </div>
  )
}