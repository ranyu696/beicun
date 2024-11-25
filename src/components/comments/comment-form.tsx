'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface CommentFormProps {
  reviewId: string
}

export function CommentForm({ reviewId }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reviewId,
          content
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '评论提交失败')
      }
      
      setContent('')
      router.refresh()
      toast({
        title: "评论提交成功",
        description: "您的评论将在审核后显示"
      })
    } catch (error) {
      console.error('Error submitting comment:', error)
      toast({
        title: "评论提交失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="写下你的评论..."
        rows={4}
      />

      <Button 
        type="submit" 
        disabled={isSubmitting || !content.trim()}
        className="w-full"
      >
        {isSubmitting ? '提交中...' : '发表评论'}
      </Button>
    </form>
  )
}