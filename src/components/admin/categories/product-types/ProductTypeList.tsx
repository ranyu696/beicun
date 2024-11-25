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
import { MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
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
import { Switch } from "@/components/ui/switch"

interface ProductType {
  id: string
  name: string
  description: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
}

export function ProductTypeList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [types, setTypes] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // 获取数据
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await fetch('/api/categories/product-types')
        if (!response.ok) throw new Error('获取数据失败')
        const data = await response.json()
        setTypes(data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "加载失败",
          description: "获取产品类型列表失败" + error
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTypes()
  }, [toast])

  // 处理状态切换
  const handleStatusChange = async (id: string, checked: boolean) => {
    try {
      const response = await fetch(`/api/categories/product-types/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: checked }),
      })

      if (!response.ok) throw new Error('更新失败')

      setTypes(types.map(type => 
        type.id === id ? { ...type, isActive: checked } : type
      ))

      toast({
        title: "更新成功",
        description: "状态已更新"
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
      const response = await fetch(`/api/categories/product-types/${deleteId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('删除失败')

      setTypes(types.filter(type => type.id !== deleteId))

      toast({
        title: "删除成功",
        description: "产品类型已被删除"
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
  const filteredTypes = types.filter(type =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="搜索类型名称..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>排序</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
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
            ) : filteredTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              filteredTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell>{type.name}</TableCell>
                  <TableCell>{type.description}</TableCell>
                  <TableCell>{type.sortOrder}</TableCell>
                  <TableCell>
                    <Switch
                      checked={type.isActive}
                      onCheckedChange={(checked) => handleStatusChange(type.id, checked)}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(type.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/categories/product-types/${type.id}/edit`}>
                            <Pencil className="h-4 w-4 mr-2" />
                            编辑
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(type.id)}
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
              此操作不可撤销，确定要删除这个类型吗？
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