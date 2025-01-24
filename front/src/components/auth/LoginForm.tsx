'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth"
import { Turnstile } from '@marsidev/react-turnstile'

interface LoginFormProps {
  modal?: boolean
}

export function LoginForm({ modal }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [turnstileToken, setTurnstileToken] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()

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
      await login({ 
        email, 
        password,
        turnstileToken,
      })
      
      if (!modal) {
        router.push('/')
      }
      
      toast({
        title: "登录成功",
        description: "欢迎回来！",
      })
    } catch (error: any) {
      const errorMessage = error.message || "登录失败"
      
      switch (errorMessage) {
        case "用户不存在":
          toast({
            title: "账号错误",
            description: "该邮箱尚未注册",
            variant: "destructive",
          })
          break
        case "密码错误":
          toast({
            title: "密码错误",
            description: "请检查您的密码",
            variant: "destructive",
          })
          break
        case "邮箱未验证":
          toast({
            title: "邮箱未验证",
            description: "请先验证您的邮箱后再登录",
            variant: "destructive",
          })
          break
        default:
          toast({
            title: "登录失败",
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
        <Input
          id="password"
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        {loading ? "登录中..." : "登录"}
      </Button>

      <div className="text-sm text-center space-x-4">
        <Link href="/auth/forgot-password" className="text-primary hover:underline">
          忘记密码？
        </Link>
        <Link href="/auth/register" className="text-primary hover:underline">
          注册账号
        </Link>
      </div>
    </form>
  )
}