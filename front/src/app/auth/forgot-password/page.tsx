import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: '忘记密码 - 杯村测评',
  description: '重置您的密码',
}

export default function ForgotPasswordPage() {
  return (
    <div className="container mx-auto max-w-md py-20">
      <div className="bg-card p-8 rounded-lg shadow-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">忘记密码</h1>
          <p className="text-sm text-muted-foreground">
            输入您的邮箱，我们将发送重置密码链接
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  )
} 