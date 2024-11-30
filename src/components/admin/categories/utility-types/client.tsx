"use client"

import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { UtilityTypeColumn } from "./columns"

interface UtilityTypeClientProps {
  data: UtilityTypeColumn[]
}

export function UtilityTypeClient({
  data
}: UtilityTypeClientProps) {
  const router = useRouter()

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`器具类型 (${data.length})`}
          description="管理器具类型"
        />
        <Button onClick={() => router.push(`/admin/categories/utility-types/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          添加类型
        </Button>
      </div>
    </>
  )
} 