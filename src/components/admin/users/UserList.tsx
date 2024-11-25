'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal,  Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserRole } from '@prisma/client'

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  role: 'USER' | 'EDITOR' | 'ADMIN'
  bio: string | null
  emailVerified: string | null
  lastLoginAt: string | null
  createdAt: string
}
// 从 Badge 组件的定义中获取正确的 variant 类型
type BadgeVariant = "default" | "secondary" | "destructive" | "outline"

// 定义角色标签的类型
type RoleLabel = {
  label: string
  variant: BadgeVariant
}
// 角色标签配置
const roleLabels: Record<UserRole, RoleLabel> = {
  USER: { label: '用户', variant: 'default' },
  EDITOR: { label: '编辑', variant: 'secondary' },
  ADMIN: { label: '管理员', variant: 'destructive' },
} as const

export function UserList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users')
        if (!response.ok) throw new Error('获取数据失败')
        const data = await response.json()
        setUsers(data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "加载失败",
          description: "获取用户列表失败" + error
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [toast])

  // 处理角色更新
  const handleRoleUpdate = async (id: string, role: 'USER' | 'EDITOR' | 'ADMIN') => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      })

      if (!response.ok) throw new Error('更新失败')

      setUsers(users.map(user => 
        user.id === id ? { ...user, role } : user
      ))

      toast({
        title: "更新成功",
        description: "用户角色已更新"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "更新失败",
        description: "请稍后重试" + error
      })
    }
  }

  // 处理删除
  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/users/${deleteId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('删除失败')

      setUsers(users.filter(user => user.id !== deleteId))

      toast({
        title: "删除成功",
        description: "用户已被删除"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "删除失败",
        description: "请稍后重试" + error
      })
    } finally {
      setDeleteId(null)
    }
  }

  // 过滤搜索结果
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="搜索用户名或邮箱..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>邮箱验证</TableHead>
              <TableHead>最后登录</TableHead>
              <TableHead>注册时间</TableHead>
              <TableHead className="w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    加载中...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback>
                          {user.name?.charAt(0) || user.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name || '未设置昵称'}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
  <Badge variant={roleLabels[user.role].variant}>
    {roleLabels[user.role].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.emailVerified ? (
                      <Badge variant="default">已验证</Badge>
                    ) : (
                      <Badge variant="secondary">未验证</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.lastLoginAt ? 
                      new Date(user.lastLoginAt).toLocaleString() : 
                      '从未登录'
                    }
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleRoleUpdate(user.id, 'USER')}
                          disabled={user.role === 'USER'}
                        >
                          设为用户
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleUpdate(user.id, 'EDITOR')}
                          disabled={user.role === 'EDITOR'}
                        >
                          设为编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleUpdate(user.id, 'ADMIN')}
                          disabled={user.role === 'ADMIN'}
                        >
                          设为管理员
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(user.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              此操作不可撤销，确定要删除这个用户吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>确认</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}