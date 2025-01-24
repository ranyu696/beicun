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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { MoreHorizontal, Plus, Search } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '@/services/user'
import type { User } from '@/types/user'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function UserList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // 获取用户列表
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', page, searchTerm],
    queryFn: () => userApi.getUsers({
      page,
      pageSize: 10,
      keyword: searchTerm
    })
  })

  // 更新用户状态
  const updateUserStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      userApi.updateUserStatus(id, status),
    onSuccess: () => {
      toast({ title: '成功', description: '用户状态更新成功' })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: () => {
      toast({
        title: '错误',
        description: '更新用户状态失败',
        variant: 'destructive',
      })
    },
  })

  // 计算总页数
  const totalPages = usersData?.data?.total
    ? Math.ceil(usersData.data.total / 10)
    : 1

  // 生成页码数组
  const getPageNumbers = () => {
    const pages: number[] = []
    const maxVisiblePages = 5 // 最多显示5个页码
    const halfVisible = Math.floor(maxVisiblePages / 2)
    
    // 计算初始的起始页
    let startPage = Math.max(1, page - halfVisible)
    
    // 计算结束页，这个值不会改变
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    
    // 如果页码数不够，调整起始页
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }
    
    // 生成页码数组
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    return pages
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">用户管理</h2>
          <p className="text-muted-foreground">
            管理系统用户和权限
          </p>
        </div>
        <Button onClick={() => navigate('/user/create')}>
          <Plus className="mr-2 h-4 w-4" />
          新建用户
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索用户..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>注册时间</TableHead>
              <TableHead>最后登录</TableHead>
              <TableHead className="w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  加载中...
                </TableCell>
              </TableRow>
            ) : usersData?.data?.list && usersData.data.list.length > 0 ? (
              usersData.data.list.map((user: User) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.name[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {user.role === 'ADMIN' ? '管理员' : '普通用户'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.status === 'active' ? 'default' : 'secondary'}
                    >
                      {user.status === 'active' ? '正常' : '已禁用'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleString()
                      : '从未登录'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">打开菜单</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigate(`/user/detail/${user.id}`)}
                        >
                          查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate(`/user/edit/${user.id}`)}
                        >
                          编辑信息
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            updateUserStatusMutation.mutate({
                              id: user.id,
                              status: user.status === 'active' ? 'inactive' : 'active',
                            })
                          }
                        >
                          {user.status === 'active' ? '禁用账号' : '启用账号'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {usersData?.data?.total ? (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                className={page === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {getPageNumbers().map((pageNumber) => (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  onClick={() => handlePageChange(pageNumber)}
                  isActive={page === pageNumber}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            ))}

            {totalPages > 5 && page < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  )
}
