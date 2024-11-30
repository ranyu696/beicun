"use client"

import { useState } from "react"
import { Check, MoreHorizontal, X, Trash } from "lucide-react"

import { useRouter } from "next/navigation"

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { AlertModal } from "@/components/admin/modals/alert-modal"
import { useToast } from "@/hooks/use-toast"

import { CommentColumn } from "./columns"

interface CellActionProps {
  data: CommentColumn
}

export function CellAction({
  data,
}: CellActionProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const onStatusChange = async (status: 'APPROVED' | 'REJECTED') => {
    try {
      setLoading(true)
      await fetch(`/api/comments/${data.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })
      toast({
        title: "操作成功",
        description: "状态已更新",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "操作失败",
        description: "状态更新失败，请重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      await fetch(`/api/comments/${data.id}`, {
        method: 'DELETE'
      })
      toast({
        title: "删除成功",
        description: "评论已删除",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "删除失败",
        description: "删除评论失败，请重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <AlertModal 
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">打开菜单</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>操作</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => onStatusChange('APPROVED')}
            disabled={data.status === 'APPROVED' || loading}
          >
            <Check className="mr-2 h-4 w-4" /> 通过
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onStatusChange('REJECTED')}
            disabled={data.status === 'REJECTED' || loading}
            className="text-red-600"
          >
            <X className="mr-2 h-4 w-4" /> 拒绝
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setOpen(true)}
            disabled={loading}
            className="text-red-600"
          >
            <Trash className="mr-2 h-4 w-4" /> 删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
} 