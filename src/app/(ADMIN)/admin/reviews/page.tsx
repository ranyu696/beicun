import { Metadata } from "next"
import { ReviewList } from "@/components/admin/reviews/ReviewList"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "测评管理 - 后台管理",
  description: "管理用户测评",
}

export default function ReviewsPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">测评管理</h2>
        <Button asChild>
          <Link href="/admin/reviews/new">
            <Plus className="h-4 w-4 mr-2" />
            新增测评
          </Link>
        </Button>
      </div>

      <ReviewList />
    </div>
  )
}