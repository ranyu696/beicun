import { type ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { type Type } from '@/types/type'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'

export const columns = (
  onEdit: (id: string) => void,
  onDelete: (id: string) => void,
): ColumnDef<Type>[] => [
  {
    accessorKey: 'name',
    header: '名称',
  },
  {
    accessorKey: 'description',
    header: '描述',
    cell: ({ row }) => row.original.description || '-',
  },
  {
    accessorKey: 'sortOrder',
    header: '排序',
  },
  {
    accessorKey: 'createdAt',
    header: '创建时间',
    cell: ({ row }) => format(new Date(row.original.createdAt), 'yyyy-MM-dd HH:mm:ss'),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">打开菜单</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(row.original.id)}>
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(row.original.id)}
            >
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
