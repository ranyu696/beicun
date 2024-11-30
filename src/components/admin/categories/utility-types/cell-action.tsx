"use client"

import { useState } from "react"
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react"

import { useRouter } from "next/navigation"

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { AlertModal } from "@/components/admin/modals/alert-modal"

import { UtilityTypeColumn } from "./columns"
import { useToast } from "@/hooks/use-toast"

interface CellActionProps {
  data: UtilityTypeColumn
}

export function CellAction({
  data,
}: CellActionProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const { toast } = useToast()

  const onConfirm = async () => {
    try {
      setLoading(true)
      await fetch(`/api/utility-types/${data.id}`, {
        method: 'DELETE'
      })
      toast({
        title: '器具类型已删除',
        description: '器具类型已成功删除',
      })
      router.refresh()
    } catch (error) {
      toast({
        title: '删除失败',
        description: '删除失败'+error,
      })
    } finally {
      setOpen(false)
      setLoading(false)
    }
  }

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id)
    toast({
      title: 'ID已复制',
      description: 'ID已成功复制',
    })
  }

  return (
    <>
      <AlertModal 
        isOpen={open} 
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
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
            onClick={() => onCopy(data.id)}
          >
            <Copy className="mr-2 h-4 w-4" /> 复制ID
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/admin/utility-types/${data.id}`)}
          >
            <Edit className="mr-2 h-4 w-4" /> 编辑
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setOpen(true)}
            className="text-red-600"
          >
            <Trash className="mr-2 h-4 w-4" /> 删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
} 