'use client'

import { useState, useEffect, useCallback } from 'react'
import { R2Object } from '@/lib/r2'
import { R2Upload } from '@/components/upload/R2Upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import { 
  FolderIcon, 
  FileIcon, 
  ChevronLeft, 
  FolderPlus,
  Link as LinkIcon,
  Trash2,
  Grid,
  List,
  ArrowUpDown,
  Calendar
} from 'lucide-react'
import { formatFileSize } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type ViewMode = 'grid' | 'list'
type SortField = 'name' | 'date'
type SortOrder = 'asc' | 'desc'

export function R2Manager() {
  const [objects, setObjects] = useState<R2Object[]>([])
  const [loading, setLoading] = useState(true)
  const [prefix, setPrefix] = useState('')
  const [continuationToken, setContinuationToken] = useState<string>()
  const [newFolder, setNewFolder] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const { toast } = useToast()

  // 加载文件列表
  const loadObjects = useCallback(async (newPrefix?: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (newPrefix || prefix) params.set("prefix", newPrefix ?? prefix)
      if (continuationToken) params.set("continuationToken", continuationToken)
      params.set("sortBy", sortField)
      params.set("sortOrder", sortOrder)

      const response = await fetch(`/api/r2?${params}`)
      if (!response.ok) throw new Error("加载失败")
      
      const result = await response.json()
      
      if (newPrefix !== undefined) {
        setObjects(result.objects)
      } else {
        setObjects(prev => [...prev, ...result.objects])
      }
      
      setContinuationToken(result.nextContinuationToken)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "加载失败",
        description: error instanceof Error ? error.message : "无法加载文件列表"
      })
    } finally {
      setLoading(false)
    }
  }, [prefix, continuationToken, sortField, sortOrder, toast])

  // 复制链接
  const handleCopyUrl = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: "复制成功",
        description: "文件链接已复制到剪贴板"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "复制失败",
        description: "无法复制到剪贴板" + error
      })
    }
  }, [toast])

  // 删除文件
  const handleDelete = useCallback(async (key: string) => {
    if (!confirm('确定要删除这个文件吗？')) return

    try {
      const response = await fetch('/api/r2', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      })

      if (!response.ok) throw new Error("删除失败")
      
      setObjects(prev => prev.filter(obj => obj.key !== key))
      toast({
        title: "删除成功",
        description: "文件已被删除"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "删除失败",
        description: error instanceof Error ? error.message : "无法删除文件"
      })
    }
  }, [toast])

  // 创建文件夹
  const handleCreateFolder = useCallback(async (folderName: string) => {
    if (!folderName.trim()) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "文件夹名称不能为空"
      })
      return
    }

    try {
      const response = await fetch('/api/r2/folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          path: `${prefix ? prefix + '/' : ''}${folderName.trim()}/`
        })
      })

      if (!response.ok) throw new Error("创建失败")
      
      toast({
        title: "创建成功",
        description: "文件夹已创建"
      })
      
      setNewFolder('')
      setIsDialogOpen(false)
      loadObjects(prefix)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "创建失败",
        description: error instanceof Error ? error.message : "无法创建文件夹"
      })
    }
  }, [prefix, toast, loadObjects])

  // 进入文件夹
  const handleEnterFolder = useCallback((folderKey: string) => {
    setPrefix(folderKey)
    setContinuationToken(undefined)
    setObjects([])
    loadObjects(folderKey)
  }, [loadObjects])

  // 返回上级
  const handleBack = useCallback(() => {
    const newPrefix = prefix.split('/').slice(0, -1).join('/')
    setPrefix(newPrefix)
    setContinuationToken(undefined)
    setObjects([])
    loadObjects(newPrefix)
  }, [prefix, loadObjects])

  // 切换排序
  const handleSort = useCallback((field: SortField) => {
    if (field === sortField) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }, [sortField])

  // 初始加载
  useEffect(() => {
    loadObjects()
  }, [loadObjects])

  return (
    <div className="space-y-6 p-6">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {prefix && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>当前位置:</span>
            <span className="font-medium text-foreground">
              {prefix || '根目录'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 视图切换 */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? (
              <List className="h-4 w-4" />
            ) : (
              <Grid className="h-4 w-4" />
            )}
          </Button>

          {/* 排序选项 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                {sortField === 'name' ? (
                  <ArrowUpDown className="h-4 w-4" />
                ) : (
                  <Calendar className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSort('name')}>
                按名称排序 {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('date')}>
                按日期排序 {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 创建文件夹 */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <FolderPlus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建文件夹</DialogTitle>
              </DialogHeader>
              <form 
                onSubmit={(e) => {
                  e.preventDefault()
                  handleCreateFolder(newFolder)
                }} 
                className="space-y-4"
              >
                <Input
                  placeholder="输入文件夹名称..."
                  value={newFolder}
                  onChange={(e) => setNewFolder(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    取消
                  </Button>
                  <Button type="submit">创建</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* 上传按钮 */}
          <R2Upload 
            onUpload={() => loadObjects(prefix)} 
            prefix={prefix}
          />
        </div>
      </div>

      {/* 文件列表 */}
      {loading && objects.length === 0 ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : objects.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          暂无文件
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {objects.map((object, index) => (
            <div
              key={`${object.key}-${index}`}
              className="group border rounded-lg p-4 space-y-2 hover:border-primary/20 transition-colors"
            >
              {object.isFolder ? (
                <button
                  onClick={() => handleEnterFolder(object.key)}
                  className="w-full aspect-square flex flex-col items-center justify-center gap-2 bg-muted/50 rounded hover:bg-muted transition-colors"
                >
                  <FolderIcon className="h-12 w-12 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {object.filename}
                  </span>
                </button>
              ) : object.type.match(/^(jpg|jpeg|png|gif|webp)$/i) ? (
                <div className="relative aspect-square bg-muted rounded overflow-hidden">
                  <Image
                    src={object.url}
                    alt={object.filename}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="aspect-square flex flex-col items-center justify-center gap-2 bg-muted rounded">
                  <FileIcon className="h-12 w-12 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground uppercase">
                    {object.type || '未知'}
                  </span>
                </div>
              )}
              
              <div className="space-y-1">
                <p className="text-sm truncate" title={object.filename}>
                  {object.filename}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(object.size)}
                </p>
                <div className="flex gap-2">
                  {!object.isFolder && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyUrl(object.url)}
                      className="flex-1"
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      复制链接
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(object.key)}
                    className={object.isFolder ? 'flex-1' : ''}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    删除
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {objects.map((object, index) => (
            <div
              key={`${object.key}-${index}`}
              className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {object.isFolder ? (
                  <FolderIcon className="h-5 w-5 text-muted-foreground" />
                ) : object.type.match(/^(jpg|jpeg|png|gif|webp)$/i) ? (
                  <div className="relative h-10 w-10 rounded overflow-hidden">
                    <Image
                      src={object.url}
                      alt={object.filename}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <FileIcon className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {object.filename}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(object.size)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!object.isFolder && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyUrl(object.url)}
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(object.key)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}