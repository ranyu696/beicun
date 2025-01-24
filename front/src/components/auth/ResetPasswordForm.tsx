'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Turnstile } from '@marsidev/react-turnstile'

interface ResetPasswordFormProps {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [turnstileToken, setTurnstileToken] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // 验证密码
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "密码不匹配",
        description: "请确保两次输入的密码相同"
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "密码太短",
        description: "密码长度至少为6位"
      })
      return
    }

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
          turnstileToken,
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "重置密码失败")
      }

      toast({
        title: "密码已重置",
        description: "请使用新密码登录"
      })

      router.push("/auth/login")
    } catch (error: any) {
      const errorMessage = error.message || "重置密码失败"
      
      switch (errorMessage) {
        case "原密码错误":
          toast({
            title: "密码错误",
            description: "原密码不正确",
            variant: "destructive",
          })
          break
        case "新密码不能与原密码相同":
          toast({
            title: "密码错误",
            description: "新密码不能与原密码相同",
            variant: "destructive",
          })
          break
        default:
          toast({
            title: "重置失败",
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
          id="oldPassword"
          type="password"
          placeholder="原密码"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          disabled={loading}
          required
        />
        <Input
          id="newPassword"
          type="password"
          placeholder="新密码"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={loading}
          required
        />
        <Input
          id="confirmPassword"
          type="password"
          placeholder="确认新密码"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
        {loading ? "重置中..." : "重置密码"}
      </Button>

      <div className="text-sm text-center">
        <Link href="/auth/login" className="text-primary hover:underline">
          返回登录
        </Link>
      </div>
    </form>
  )
}