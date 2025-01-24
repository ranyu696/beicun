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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MoreHorizontal, Plus, Search } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productApi } from '@/services/product'
import { brandApi } from '@/services/brand'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/types/product'
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
import { Brand } from '@/types/brand'
import { PageData } from '@/types/api'

const PAGE_SIZE = 10

export default function ProductList() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBrandId, setSelectedBrandId] = useState<string>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // 获取产品列表
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', page, searchTerm, selectedBrandId],
    queryFn: async () => {
      const response = await productApi.getProducts({
        page,
        pageSize: PAGE_SIZE,
        keyword: searchTerm,
        brandId: selectedBrandId === 'all' ? undefined : selectedBrandId,
      })
      return response.data
    }
  })

  // 获取品牌列表
  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await brandApi.getBrands({
        page: 1,
        pageSize: 999
      })
      return response.data
    }
  })

  // 删除产品
  const { mutate: deleteProduct } = useMutation({
    mutationFn: (id: string) => productApi.deleteProduct(id),
    onSuccess: () => {
      toast({ title: '成功', description: '产品删除成功' })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: () => {
      toast({
        title: '错误',
        description: '删除失败',
        variant: 'destructive',
      })
    },
  })

  // 渲染品牌选项
  const renderBrandOptions = (brands: PageData<Brand>): JSX.Element[] => {
    if (!brands?.list || !Array.isArray(brands.list)) {
      return [
        <SelectItem key="all" value="all">
          全部品牌
        </SelectItem>
      ]
    }

    return [
      <SelectItem key="all" value="all">
        全部品牌
      </SelectItem>,
      ...brands.list.map((brand) => (
        <SelectItem key={brand.id} value={brand.id}>
          {brand.name}
        </SelectItem>
      ))
    ]
  }

  // 处理品牌选择
  const handleBrandChange = (value: string) => {
    setSelectedBrandId(value)
    setPage(1) // 重置页码
  }

  // 计算总页数
  const totalPages = productsData?.totalPages ?? 0

  // 处理页码变化
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">产品管理</h1>
        <Button onClick={() => navigate('/product/create')}>
          <Plus className="mr-2 h-4 w-4" />
          新增产品
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center space-x-2 md:max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索产品..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
              className="pl-8"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={selectedBrandId || 'all'} onValueChange={handleBrandChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择品牌" />
            </SelectTrigger>
            <SelectContent>
              {brandsData && renderBrandOptions(brandsData)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>产品名称</TableHead>
              <TableHead>品牌</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>价格</TableHead>
              <TableHead>重量</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  加载中...
                </TableCell>
              </TableRow>
            ) : productsData?.list?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              productsData?.list?.map((product: Product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.brand?.name}</TableCell>
                  <TableCell>{product.productTypeId}</TableCell>
                  <TableCell>¥{product.price}</TableCell>
                  <TableCell>{product.weight}g</TableCell>
                  <TableCell>
                    <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {product.status === 'ACTIVE' ? '上架' : '下架'}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(product.createdAt), 'yyyy-MM-dd')}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">打开菜单</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/product/detail/${product.id}`)}>
                          查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/product/edit/${product.id}`)}>
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => deleteProduct(product.id)}
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

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (page > 1) setPage(page - 1)
                  }}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(num => {
                  if (totalPages <= 7) return true
                  if (num === 1 || num === totalPages) return true
                  if (num >= page - 2 && num <= page + 2) return true
                  return false
                })
                .map((pageNum, index, array) => {
                  if (index > 0 && pageNum - array[index - 1] > 1) {
                    return (
                      <PaginationItem key={`ellipsis-${pageNum}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  }
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNum)}
                        isActive={page === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (page < totalPages) setPage(page + 1)
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
