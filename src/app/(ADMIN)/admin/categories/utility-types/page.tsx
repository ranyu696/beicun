import { DataTable } from "@/components/ui/data-table"
import { columns } from "../../../../../components/admin/categories/utility-types/columns"
import { prisma } from "@/lib/prisma"
import { Separator } from "@/components/ui/separator"
import { UtilityTypeClient } from "@/components/admin/categories/utility-types/client"
import { format } from "date-fns"
import { UtilityTypeColumn } from "@/components/admin/categories/utility-types/columns"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "器具类型 - 后台管理",
  description: "管理器具类型",
}

export default async function UtilityTypesPage() {
  const utilityTypesData = await prisma.utilityType.findMany({
    orderBy: {
      sortOrder: 'asc'
    }
  })

  // 格式化数据以匹配 UtilityTypeColumn 类型
  const utilityTypes: UtilityTypeColumn[] = utilityTypesData.map(type => ({
    id: type.id,
    name: type.name,
    description: type.description,
    icon: type.icon,
    sortOrder: type.sortOrder,
    isActive: type.isActive,
    createdAt: format(type.createdAt, 'yyyy-MM-dd HH:mm:ss')
  }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <UtilityTypeClient data={utilityTypes} />
        <Separator />
        <DataTable columns={columns} data={utilityTypes} searchKey="name" />
      </div>
    </div>
  )
} 