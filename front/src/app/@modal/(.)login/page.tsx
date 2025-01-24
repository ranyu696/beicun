'use client'

import { LoginForm } from "@/components/auth/LoginForm"
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog"

export default function LoginModal() {
  return (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>登录账号</DialogTitle>
          <DialogDescription>
            输入您的邮箱和密码登录
          </DialogDescription>
        </DialogHeader>
        <LoginForm modal />
      </DialogContent>
    </Dialog>
  )
}