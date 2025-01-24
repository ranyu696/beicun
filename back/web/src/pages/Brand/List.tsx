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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Plus, Search } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { brandApi } from '@/services/brand'
import type { Brand } from '@/types/brand'
import { format } from 'date-fns'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowDown, ArrowUp } from 'lucide-react'

const PAGE_SIZE = 10

export default function BrandList() {
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [sortBy, setSortBy] = useState<'updatedAt' | 'default'>('default')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // 获取品牌列表
  const { data: brandsData, isLoading } = useQuery({
    queryKey: ['brands', page, PAGE_SIZE, keyword, sortBy, sortOrder],
    queryFn: () => brandApi.getBrands({
      page,
      pageSize: PAGE_SIZE,
      keyword,
      sortBy: sortBy === 'default' ? undefined : sortBy,
      sortOrder,
    })
  })

  // 删除品牌
  const { mutate: deleteBrand, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => brandApi.deleteBrand(id),
    onSuccess: () => {
      toast({ title: '成功', description: '品牌删除成功' })
      queryClient.invalidateQueries({ queryKey: ['brands'] })
    },
    onError: () => {
      toast({
        title: '错误',
        description: '删除品牌失败',
        variant: 'destructive',
      })
    },
  })

  // 计算总页数
  const totalPages = brandsData?.data?.total
    ? Math.ceil(brandsData.data.total / PAGE_SIZE)
    : 0

  // 生成页码数组
  const getPageNumbers = () => {
    const pageNumbers: number[] = []
    const maxVisiblePages = 5
    const startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    return pageNumbers
  }

  // 处理页码变化
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索品牌..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-8 w-[250px]"
            />
          </div>
          <Select
            value={sortBy}
            onValueChange={(value: 'updatedAt' | 'default') => {
              setSortBy(value)
              if (value === 'updatedAt' && !sortOrder) {
                setSortOrder('desc')
              }
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="排序方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">默认排序</SelectItem>
              <SelectItem value="updatedAt">更新时间</SelectItem>
            </SelectContent>
          </Select>
          {sortBy === 'updatedAt' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        <Button onClick={() => navigate('/brand/create')}>
          <Plus className="mr-2 h-4 w-4" />
          新建品牌
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>网站</TableHead>
              <TableHead>排序</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  加载中...
                </TableCell>
              </TableRow>
            ) : !brandsData?.data?.list?.length ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              brandsData.data.list.map((brand: Brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell>{brand.description || '-'}</TableCell>
                  <TableCell>
                    {brand.website ? (
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {brand.website}
                      </a>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{brand.sortOrder}</TableCell>
                  <TableCell>
                    {brand.createdAt ? format(new Date(brand.createdAt), 'yyyy-MM-dd HH:mm:ss') : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">打开菜单</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigate(`/brand/edit/${brand.id}`)}
                        >
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => deleteBrand(brand.id)}
                          disabled={isDeleting}
                        >
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      {totalPages > 0 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(page - 1)}
                  className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {getPageNumbers().map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => handlePageChange(pageNum)}
                    isActive={page === pageNum}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {totalPages > getPageNumbers()[getPageNumbers().length - 1] && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(page + 1)}
                  className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
