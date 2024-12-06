import { RegisterForm } from "@/components/auth/RegisterForm"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: '注册 - 杯村测评',
  description: '创建新账号',
}

export default function RegisterPage() {
  return (
    <div className="container mx-auto max-w-md py-20">
      <div className="bg-card p-8 rounded-lg shadow-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">创建账号</h1>
          <p className="text-sm text-muted-foreground">
            注册新账号开始探索
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}