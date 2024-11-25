'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "登录失败",
          description: result.error
        })
        return
      }

      // 登录成功
      toast({
        title: "登录成功",
        description: "欢迎回来！"
      })
      
      router.push("/") // 重定向到首页
      router.refresh() // 刷新页面以更新导航状态
    } catch (error) {
      toast({
        variant: "destructive",
        title: "登录失败",  
        description: "请稍后重试 " + error
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">登录账号</h1>
        <p className="text-sm text-muted-foreground">
          输入您的邮箱和密码登录
        </p>
      </div>
      <div className="space-y-4">
        <Input
          type="email"
          placeholder="邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
        <Input
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />
        <Button 
          type="submit" 
          className="w-full"
          disabled={loading}
        >
          {loading ? "登录中..." : "登录"}
        </Button>
      </div>
      <div className="text-sm text-center space-x-4">
        <Link 
          href="/register" 
          className="text-blue-500 hover:text-blue-700"
          tabIndex={loading ? -1 : 0}
        >
          注册账号
        </Link>
        <Link 
          href="/forgot-password" 
          className="text-blue-500 hover:text-blue-700"
          tabIndex={loading ? -1 : 0}
        >
          忘记密码？
        </Link>
      </div>
    </form>
  )
}