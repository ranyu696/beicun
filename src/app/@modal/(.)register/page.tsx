'use client'

import { RegisterForm } from "@/components/auth/RegisterForm"
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog"

export default function RegisterModal() {
  return (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建账号</DialogTitle>
          <DialogDescription>
            注册新账号开始探索
          </DialogDescription>
        </DialogHeader>
        <RegisterForm modal />
      </DialogContent>
    </Dialog>
  )
}