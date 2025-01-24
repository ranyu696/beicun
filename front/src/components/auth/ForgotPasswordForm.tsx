'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Turnstile } from '@marsidev/react-turnstile'

interface ForgotPasswordFormProps {
  modal?: boolean
}

export function ForgotPasswordForm({ modal }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("")
  const [turnstileToken, setTurnstileToken] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!turnstileToken) {
      toast({
        title: "验证失败",
        description: "请完成人机验证",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email,
          turnstileToken,
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "发送重置邮件失败")
      }

      toast({
        title: "邮件已发送",
        description: "请查看您的邮箱，点击链接重置密码"
      })

      if (!modal) {
        router.push("/auth/login")
      }
    } catch (error: any) {
      const errorMessage = error.message || "发送重置邮件失败"
      
      switch (errorMessage) {
        case "用户不存在":
          toast({
            title: "邮箱错误",
            description: "该邮箱尚未注册",
            variant: "destructive",
          })
          break
        default:
          toast({
            title: "发送失败",
            description: errorMessage,
            variant: "destructive",
          })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          id="email"
          type="email"
          placeholder="邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <div className="flex justify-center">
        <Turnstile
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
          onSuccess={setTurnstileToken}
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={loading || !turnstileToken}
      >
        {loading ? "发送中..." : "发送重置邮件"}
      </Button>

      <div className="text-sm text-center">
        <Link href="/auth/login" className="text-primary hover:underline">
          返回登录
        </Link>
      </div>
    </form>
  )
}