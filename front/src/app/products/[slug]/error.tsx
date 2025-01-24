'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <CardTitle>出错了</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {error.message || '加载产品信息时出现错误'}
        </p>
        <div className="flex gap-4">
          <Button onClick={() => reset()}>重试</Button>
          <Button variant="outline" onClick={() => window.location.href = '/products'}>
            返回列表
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}