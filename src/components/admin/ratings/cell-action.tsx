"use client"

import { useState } from "react"
import { MoreHorizontal, Trash } from "lucide-react"
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
import { RatingColumn } from "./columns"

interface CellActionProps {
  data: RatingColumn
}

export function CellAction({
  data,
}: CellActionProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const onDelete = async () => {
    try {
      setLoading(true)
      await fetch(`/api/ratings/${data.id}`, {
        method: 'DELETE'
      })
      toast({
        title: "删除成功",
        description: "评分已删除",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "删除失败",
        description: "删除评分失败，请重试",
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