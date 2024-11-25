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
import { MoreHorizontal, Eye, Archive, Loader2, CheckCircle2, XCircle } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Image from 'next/image'
import { ReviewStatus } from '@prisma/client'

interface Review {
  id: string
  title: string
  status: 'PENDING' | 'PUBLISHED' | 'ARCHIVED'
  views: number
  isRecommended: boolean
  publishedAt: string | null
  createdAt: string
  product: {
    id: string
    name: string
    mainImage: string
  }
  author: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}
// 定义 Badge variant 的类型
type BadgeVariant = "default" | "secondary" | "destructive" | "outline"

// 定义状态标签的类型
type StatusLabel = {
  label: string
  variant: BadgeVariant
}

// 状态标签配置
const statusLabels: Record<ReviewStatus, StatusLabel> = {
  PENDING: { 
    label: '待审核', 
    variant: 'secondary' 
  },
  PUBLISHED: { 
    label: '已发布', 
    variant: 'default' 
  },
  ARCHIVED: { 
    label: '已归档', 
    variant: 'outline' 
  }
}


export function ReviewList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [archiveId, setArchiveId] = useState<string | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/reviews')
        if (!response.ok) throw new Error('获取数据失败')
        const data = await response.json()
        setReviews(data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "加载失败",
          description: "获取测评列表失败" + error
        })
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [toast])

  // 处理状态更新
  const handleStatusUpdate = async (id: string, status: 'PENDING' | 'PUBLISHED' | 'ARCHIVED') => {
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) throw new Error('更新失败')

      setReviews(reviews.map(review => 
        review.id === id ? { ...review, status } : review
      ))

      toast({
        title: "更新成功",
        description: "测评状态已更新"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "更新失败",
        description: "请稍后重试" + error
      })
    }
  }

  // 处理推荐状态更新
  const handleRecommendedUpdate = async (id: string, isRecommended: boolean) => {
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRecommended }),
      })

      if (!response.ok) throw new Error('更新失败')

      setReviews(reviews.map(review => 
        review.id === id ? { ...review, isRecommended } : review
      ))

      toast({
        title: "更新成功",
        description: `测评${isRecommended ? '已设为' : '已取消'}推荐`
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "更新失败",
        description: "请稍后重试" + error
      })
    }
  }

  // 过滤搜索结果
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.author.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.author.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="搜索标题、产品或作者..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="PENDING">待审核</SelectItem>
            <SelectItem value="PUBLISHED">已发布</SelectItem>
            <SelectItem value="ARCHIVED">已归档</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标题</TableHead>
              <TableHead>作者</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>浏览量</TableHead>
              <TableHead>推荐</TableHead>
              <TableHead>发布时间</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    加载中...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredReviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              filteredReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10">
                        <Image
                          src={review.product.mainImage}
                          alt={review.product.name}
                          width={40}
                          height={40}
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{review.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {review.product.name}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={review.author.image || undefined} />
                        <AvatarFallback>
                          {review.author.name?.charAt(0) || review.author.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{review.author.name || review.author.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
  <Badge variant={statusLabels[review.status].variant}>
                      {statusLabels[review.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>{review.views}</TableCell>
                  <TableCell>
                    {review.isRecommended ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-300" />
                    )}
                  </TableCell>
                  <TableCell>
                    {review.publishedAt ? 
                      new Date(review.publishedAt).toLocaleString() : 
                      '-'
                    }
                  </TableCell>
                  <TableCell>
                    {new Date(review.createdAt).toLocaleDateString()}
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
                          <Link href={`/admin/reviews/${review.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            查看
                          </Link>
                        </DropdownMenuItem>
                        {review.status === 'PENDING' && (
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(review.id, 'PUBLISHED')}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            通过审核
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleRecommendedUpdate(review.id, !review.isRecommended)}
                        >
                          {review.isRecommended ? (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              取消推荐
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              设为推荐
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setArchiveId(review.id)}
                          className="text-destructive"
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          归档
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

      <AlertDialog open={!!archiveId} onOpenChange={() => setArchiveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认归档</AlertDialogTitle>
            <AlertDialogDescription>
              归档后的测评将不会在前台显示，确定要归档这篇测评吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (archiveId) {
                  handleStatusUpdate(archiveId, 'ARCHIVED')
                  setArchiveId(null)
                }
              }}
            >
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}