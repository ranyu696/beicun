'use client'

import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm"
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog"

export default function ForgotPasswordModal() {
  return (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>忘记密码</DialogTitle>
          <DialogDescription>
            输入您的邮箱，我们将发送重置密码链接
          </DialogDescription>
        </DialogHeader>
        <ForgotPasswordForm modal />
      </DialogContent>
    </Dialog>
  )
} 