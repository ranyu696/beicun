"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"

export type UtilityTypeColumn = {
  id: string
  name: string
  description: string | null
  icon: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
}

export const columns: ColumnDef<UtilityTypeColumn>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "名称",
  },
  {
    accessorKey: "description",
    header: "描述",
  },
  {
    accessorKey: "icon",
    header: "图标",
    cell: ({ row }) => row.original.icon && (
      <Image
        src={row.original.icon} 
        alt={row.original.name} 
        width={32}
        height={32}
        className="w-8 h-8 object-contain"
      />
    )
  },
  {
    accessorKey: "sortOrder",
    header: "排序",
  },
  {
    accessorKey: "isActive",
    header: "状态",
    cell: ({ row }) => (
      <span className={row.original.isActive ? "text-green-600" : "text-red-600"}>
        {row.original.isActive ? "启用" : "禁用"}
      </span>
    )
  },
  {
    accessorKey: "createdAt",
    header: "创建时间",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />
  },
] 