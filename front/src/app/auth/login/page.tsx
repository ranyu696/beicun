import { Suspense } from "react"
import { LoginForm } from "@/components/auth/LoginForm"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: '登录 - 杯村测评',
  description: '登录杯村测评',
}

export default function LoginPage() {
  return (
    <div className="container mx-auto max-w-md py-20">
      <div className="bg-card p-8 rounded-lg shadow-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">登录账号</h1>
          <p className="text-sm text-muted-foreground">
            输入您的邮箱和密码登录
          </p>
        </div>
        <Suspense fallback={<div>加载中...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}