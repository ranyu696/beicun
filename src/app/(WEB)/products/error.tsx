'use client'

import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ProductsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 可以在这里添加错误日志上报
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto py-32 px-4">
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        <div className="rounded-full bg-destructive/10 p-6">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="text-3xl font-bold">出错了</h2>
        <p className="text-muted-foreground max-w-md">
          抱歉，加载产品列表时出现了问题。请稍后再试。
        </p>
        <div className="flex gap-4">
          <Button onClick={reset} variant="default">
            重试
          </Button>
          <Button variant="outline" asChild>
            <Link href="/" className="no-underline">
              返回首页
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}