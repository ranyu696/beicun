'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface ForgotPasswordFormProps {
  modal?: boolean
}

export function ForgotPasswordForm({ modal }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "发送重置邮件失败")
      }

      toast({
        title: "邮件已发送",
        description: "请查看您的邮箱，点击链接重置密码"
      })

      if (modal) {
        router.back()
      } else {
        router.push("/login")
      }
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "发送失败",
        description: error instanceof Error ? error.message : "请稍后重试"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-4">
        <Input
          type="email"
          placeholder="邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
        <Button 
          type="submit" 
          className="w-full"
          disabled={loading}
        >
          {loading ? "发送中..." : "发送重置链接"}
        </Button>
      </div>
      <div className="text-sm text-center">
        <Link 
          href="/login" 
          className="text-blue-500 hover:text-blue-700"
          tabIndex={loading ? -1 : 0}
        >
          返回登录
        </Link>
      </div>
    </form>
  )
}