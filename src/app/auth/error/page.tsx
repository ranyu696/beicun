"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  let errorMessage = "发生未知错误"
  if (error === "EMAIL_NOT_VERIFIED") {
    errorMessage = "请先验证您的邮箱"
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">认证错误</h1>
        <p className="text-gray-600 mb-6">{errorMessage}</p>
        <Button asChild>
          <Link href="/login">返回登录</Link>
        </Button>
      </div>
    </div>
  )
} 