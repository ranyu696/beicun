import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

export default function ForgotPasswordModal() {
  return (
    <Dialog open>
      <DialogTitle>忘记密码</DialogTitle>
      <DialogContent className="sm:max-w-[425px]">
        <ForgotPasswordForm />
      </DialogContent>
    </Dialog>
  )
}