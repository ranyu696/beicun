import { Metadata } from "next"
import { TagList } from "@/components/admin/tags/TagList"


export const metadata: Metadata = {
  title: "标签管理 - 后台管理",
  description: "管理产品标签",
}

export default function TagsPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">标签管理</h2>
      </div>
      <TagList />
    </div>
  )
}