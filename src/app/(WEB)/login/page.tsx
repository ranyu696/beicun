import { LoginForm } from "@/components/auth/LoginForm"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: '登录 - 杯村测评',
  description: '登录杯村测评',
}

export default function LoginPage() {
  return (
    <div className="container mx-auto max-w-md py-20">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <LoginForm />
      </div>
    </div>
  )
}