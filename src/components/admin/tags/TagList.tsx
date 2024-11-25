'use client'

import { useState, useEffect, useCallback } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

interface Tag {
  id: string
  name: string
  _count: {
    products: number
  }
  createdAt: string
}

export function TagList() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editTag, setEditTag] = useState<Tag | null>(null)
  const [newTagName, setNewTagName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tags')
      if (!response.ok) throw new Error('获取数据失败')
      const data = await response.json()
      setTags(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "加载失败",
        description: "获取标签列表失败" + error
      })
    } finally {
      setLoading(false)
    }
  }, [toast]) // 添加 toast 作为依赖

  // 将 fetchTags 添加到依赖数组中
  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  const handleCreate = async () => {
    if (!newTagName.trim()) return
    
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newTagName.trim() }),
      })

      if (!response.ok) throw new Error('创建失败')

      toast({
        title: "创建成功",
        description: "标签已创建"
      })

      setNewTagName('')
      fetchTags()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "创建失败",
        description: "请稍后重试" + error
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async () => {
    if (!editTag || !editTag.name.trim()) return
    
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/tags/${editTag.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editTag.name.trim() }),
      })

      if (!response.ok) throw new Error('更新失败')

      toast({
        title: "更新成功",
        description: "标签已更新"
      })

      setEditTag(null)
      fetchTags()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "更新失败",
        description: "请稍后重试" + error
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/tags/${deleteId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('删除失败')

      toast({
        title: "删除成功",
        description: "标签已删除"
      })

      setDeleteId(null)
      fetchTags()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "删除失败",
        description: "请稍后重试" + error
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="搜索标签..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新增标签
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新增标签</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="输入标签名称"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => setNewTagName('')}
                >
                  取消
                </Button>
                <Button 
                  onClick={handleCreate}
                  disabled={isSubmitting || !newTagName.trim()}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  确认
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标签名称</TableHead>
              <TableHead>关联产品数</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredTags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              filteredTags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>{tag.name}</TableCell>
                  <TableCell>{tag._count.products}</TableCell>
                  <TableCell>
                    {new Date(tag.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditTag(tag)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(tag.id)}
                          className="text-destructive"
                          disabled={tag._count.products > 0}
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

      <Dialog open={!!editTag} onOpenChange={() => setEditTag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑标签</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="输入标签名称"
              value={editTag?.name || ''}
              onChange={(e) => setEditTag(tag => 
                tag ? { ...tag, name: e.target.value } : null
              )}
            />
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setEditTag(null)}
              >
                取消
              </Button>
              <Button 
                onClick={handleUpdate}
                disabled={isSubmitting || !editTag?.name.trim()}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                确认
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              此操作不可撤销，确定要删除这个标签吗？
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