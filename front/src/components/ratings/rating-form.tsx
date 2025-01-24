"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface RatingFormProps {
  productId: string
  onSuccess?: () => void
}

export function RatingForm({ productId, onSuccess }: RatingFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "请选择评分",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          rating,
          reason: reason.trim() || null
        }),
      })
      const data = await response.json()
      console.log('Response:', data) // 添加日志

      if (!response.ok) {
        throw new Error(data.error || "提交失败")
      }

      toast({
        title: "评分提交成功",
        description: "感谢您的反馈！"
      })

      // 重置表单
      setRating(0)
      setReason("")
      
      // 刷新数据
      router.refresh()
      onSuccess?.()

    } catch (error) {
      console.error("Rating submission error:", error)
      toast({
        title: "评分提交失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>提交评分</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 星级评分 */}
        <div className="space-y-2">
          <div className="text-sm font-medium">您的评分</div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                onMouseEnter={() => setHoverRating(i + 1)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={cn(
                    "h-8 w-8 transition-colors",
                    (hoverRating ? i < hoverRating : i < rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300 hover:text-yellow-200"
                  )}
                />
              </button>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            {rating === 1 && "差评"}
            {rating === 2 && "较差"}
            {rating === 3 && "一般"}
            {rating === 4 && "不错"}
            {rating === 5 && "很棒"}
          </div>
        </div>

        {/* 评分理由 */}
        <div className="space-y-2">
          <div className="text-sm font-medium">评分理由 (选填)</div>
          <Textarea
            placeholder="请分享您的使用体验..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || rating === 0}
          className="w-full"
        >
          {isSubmitting ? "提交中..." : "提交评分"}
        </Button>
      </CardFooter>
    </Card>
  )
}