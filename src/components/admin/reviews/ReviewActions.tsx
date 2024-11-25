'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { MoreHorizontal, CheckCircle2, Archive, XCircle } from "lucide-react"

interface ReviewActionsProps {
  review: {
    id: string
    status: 'PENDING' | 'PUBLISHED' | 'ARCHIVED'
    isRecommended: boolean
  }
}

export function ReviewActions({ review }: ReviewActionsProps) {
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleStatusUpdate = async (status: 'PUBLISHED' | 'ARCHIVED') => {
    try {
      const response = await fetch(`/api/reviews/${review.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) throw new Error('更新失败')

      toast({
        title: "更新成功",
        description: "测评状态已更新"
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "更新失败",
        description: "请稍后重试" + error
      })
    }
  }

  const handleRecommendedUpdate = async () => {
    try {
      const response = await fetch(`/api/reviews/${review.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRecommended: !review.isRecommended }),
      })

      if (!response.ok) throw new Error('更新失败')

      toast({
        title: "更新成功",
        description: `测评${review.isRecommended ? '已取消' : '已设为'}推荐`
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "更新失败",
        description: "请稍后重试" + error
      })
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {review.status === 'PENDING' && (
            <DropdownMenuItem onClick={() => handleStatusUpdate('PUBLISHED')}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              通过审核
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleRecommendedUpdate}>
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
            onClick={() => setShowArchiveDialog(true)}
            className="text-destructive"
          >
            <Archive className="h-4 w-4 mr-2" />
            归档
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
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
                handleStatusUpdate('ARCHIVED')
                setShowArchiveDialog(false)
              }}
            >
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}