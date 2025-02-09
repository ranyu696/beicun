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
import { reviewApi } from '@/services/review'
import { Badge } from '@/components/ui/badge'
import { Review } from '@/types/review'
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ReviewList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null)
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // 获取评测列表
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['reviews', currentPage, searchTerm],
    queryFn: () => reviewApi.getReviews({
      page: currentPage,
      pageSize: 10,
      search: searchTerm
    })
  })

  const reviews = reviewsData?.data
  const totalPages = reviews?.totalPages || 0

  // 删除评测
  const deleteReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await reviewApi.deleteReview(id)
      return response.data
    },
    onSuccess: () => {
      toast({ 
        title: '删除成功', 
        description: '评测已被删除' 
      })
      setReviewToDelete(null)
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    },
    onError: () => {
      toast({
        title: '删除失败',
        description: '操作未能完成，请稍后重试',
        variant: 'destructive',
      })
      setReviewToDelete(null)
    },
  })

  // 更新评测状态
  const updateReviewStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Review['status'] }) => {
      const response = await reviewApi.updateReview(id, { status })
      return response.data
    },
    onSuccess: (_, variables) => {
      const statusText = 
        variables.status === 'PUBLISHED' ? '已发布' :
        variables.status === 'PENDING' ? '已下架' : '草稿'
      toast({ 
        title: '状态更新成功', 
        description: `评测状态已更新为${statusText}` 
      })
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    },
    onError: () => {
      toast({
        title: '状态更新失败',
        description: '操作未能完成，请稍后重试',
        variant: 'destructive',
      })
    },
  })

  // 处理分页
  const handlePageChange = (type: 'prev' | 'next') => {
    if (type === 'prev' && currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    } else if (type === 'next' && totalPages && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // 重置到第一页
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">评测管理</h2>
          <p className="text-muted-foreground">
            管理和审核用户评测
          </p>
        </div>
        <Button onClick={() => navigate('/review/create')}>
          <Plus className="mr-2 h-4 w-4" />
          新建评测
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索评测..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标题</TableHead>
              <TableHead>产品</TableHead>
              <TableHead>用户</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span>加载中...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : reviews?.list?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  暂无评测数据
                </TableCell>
              </TableRow>
            ) : reviews?.list.map((review: Review) => (
              <TableRow key={review.id}>
                <TableCell className="font-medium">{review.title}</TableCell>
                <TableCell>{review.product?.name}</TableCell>
                <TableCell>{review.author?.name}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      review.status === 'PUBLISHED'
                        ? 'default'
                        : review.status === 'PENDING'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {review.status === 'PUBLISHED'
                      ? '已发布'
                      : review.status === 'PENDING'
                      ? '已下架'
                      : '草稿'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(review.createdAt).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">打开菜单</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem
                        onClick={() => navigate(`/review/detail/${review.id}`)}
                      >
                        查看详情
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate(`/review/edit/${review.id}`)}
                      >
                        编辑
                      </DropdownMenuItem>
                      {review.status === 'PENDING' && (
                        <>
                          <DropdownMenuItem
                            onClick={() =>
                              updateReviewStatusMutation.mutate({
                                id: review.id,
                                status: 'PUBLISHED',
                              })
                            }
                            className="text-green-600"
                          >
                            发布
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              updateReviewStatusMutation.mutate({
                                id: review.id,
                                status: 'ARCHIVED',
                              })
                            }
                            className="text-red-600"
                          >
                            草稿
                          </DropdownMenuItem>
                        </>
                      )}
                      {review.status === 'PUBLISHED' && (
                        <DropdownMenuItem
                          onClick={() =>
                            updateReviewStatusMutation.mutate({
                              id: review.id,
                              status: 'PENDING',
                            })
                          }
                          className="text-red-600"
                        >
                          下架
                        </DropdownMenuItem>
                      )}
                      {review.status === 'ARCHIVED' && (
                        <DropdownMenuItem
                          onClick={() =>
                            updateReviewStatusMutation.mutate({
                              id: review.id,
                              status: 'PUBLISHED',
                            })
                          }
                          className="text-green-600"
                        >
                          发布
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setReviewToDelete(review)}
                      >
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            共 {reviews?.total || 0} 条记录
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange('prev')}
                  disabled={currentPage === 1}
                >
                  上一页
                </Button>
              </PaginationItem>
              <PaginationItem>
                <span className="px-4">
                  {currentPage} / {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange('next')}
                  disabled={currentPage === totalPages}
                >
                  下一页
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <AlertDialog open={!!reviewToDelete} onOpenChange={() => setReviewToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除评测 "{reviewToDelete?.title}" 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => reviewToDelete && deleteReviewMutation.mutate(String(reviewToDelete.id))}
              className="bg-red-600 hover:bg-red-700"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
