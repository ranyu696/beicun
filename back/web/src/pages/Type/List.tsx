import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useQuery, useMutation } from '@tanstack/react-query'
import { utilityTypeApi, productTypeApi, channelTypeApi, materialTypeApi } from '@/services/type'
import { type TypeKind } from '@/types/type'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'
import { columns } from './columns'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface TypeConfig {
  title: string
  api: typeof utilityTypeApi
  path: string
}

interface TypeListProps {
  type: TypeKind
}

const typeConfigs: Record<TypeKind, TypeConfig> = {
  utility: {
    title: '器具类型',
    api: utilityTypeApi,
    path: '/types/utility',
  },
  product: {
    title: '产品类型',
    api: productTypeApi,
    path: '/types/product',
  },
  channel: {
    title: '通道类型',
    api: channelTypeApi,
    path: '/types/channel',
  },
  material: {
    title: '材料类型',
    api: materialTypeApi,
    path: '/types/material',
  },
}

export default function TypeList({ type }: TypeListProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [keyword, setKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const currentType = typeConfigs[type]

  const { data: types, isLoading } = useQuery({
    queryKey: ['types', type, keyword, currentPage],
    queryFn: () => currentType.api.getTypes({ keyword, page: currentPage, pageSize }),
  })

  const totalPages = Math.ceil((types?.data?.total || 0) / pageSize)

  const { mutate: deleteType } = useMutation({
    mutationFn: (id: string) => currentType.api.deleteType(id),
    onSuccess: () => {
      toast({
        title: '成功',
        description: '删除成功',
      })
    },
    onError: () => {
      toast({
        title: '错误',
        description: '删除失败',
        variant: 'destructive',
      })
    },
  })

  const handleEdit = (id: string) => {
    navigate(`${currentType.path}/edit/${id}`)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const table = useReactTable({
    data: types?.data?.list || [],
    columns: columns(handleEdit, deleteType),
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">{currentType.title}列表</h2>
          <p className="text-muted-foreground">
            管理所有{currentType.title}
          </p>
        </div>
        <Button onClick={() => navigate(`${currentType.path}/create`)}>
          <Plus className="mr-2 h-4 w-4" />
          新建{currentType.title}
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder={`搜索${currentType.title}`}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="text-center"
                >
                  加载中...
                </TableCell>
              </TableRow>
            ) : !types?.data?.list?.length ? (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="text-center"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1
                // Show first page, last page, and pages around current page
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 2 && page <= currentPage + 2)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                } else if (
                  page === currentPage - 3 ||
                  page === currentPage + 3
                ) {
                  return <PaginationEllipsis key={page} />
                }
                return null
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
