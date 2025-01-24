'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth"
import { Turnstile } from '@marsidev/react-turnstile'
import { CaptchaType } from "@/types/auth"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

interface RegisterFormProps {
  modal?: boolean
}

export function RegisterForm({ modal }: RegisterFormProps) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [turnstileToken, setTurnstileToken] = useState("")
  const [verifyCode, setVerifyCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const router = useRouter()
  const { toast } = useToast()
  const { register } = useAuth()

  // 发送验证码
  const handleSendCode = async () => {
    if (!email) {
      toast({
        title: "请输入邮箱",
        variant: "destructive",
      })
      return
    }

    try {
      setSendingCode(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          type: 'register',
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '发送验证码失败')
      }
      
      toast({
        title: "验证码已发送",
        description: "请查看您的邮箱",
      })
      
      // 开始倒计时
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error: any) {
      const message = error.message || '发送验证码失败'
      toast({
        title: "发送失败",
        description: message,
        variant: "destructive",
      })
    } finally {
      setSendingCode(false)
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "密码不匹配",
        description: "请确保两次输入的密码相同"
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

    if (!verifyCode || verifyCode.length !== 6) {
      toast({
        title: "验证码错误",
        description: "请输入6位验证码",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "密码太短",
        description: "密码长度至少为6位"
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          password,
          turnstileToken,
          verifyCode,
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '注册失败')
      }

      toast({
        title: "注册成功",
        description: "欢迎加入杯村！",
      })

      if (!modal) {
        router.push('/dashboard')
      }
    } catch (error: any) {
      const errorMessage = error.message || "注册失败"
      
      switch (errorMessage) {
        case "邮箱已存在":
          toast({
            title: "注册失败",
            description: "该邮箱已被注册",
            variant: "destructive",
          })
          break
        default:
          toast({
            title: "注册失败",
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
        <div className="flex space-x-2">
          <Input
            id="email"
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            autoComplete="email"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleSendCode}
            disabled={loading || sendingCode || countdown > 0}
          >
            {countdown > 0 ? `${countdown}秒` : (sendingCode ? "发送中..." : "发送验证码")}
          </Button>
        </div>
        <div className="flex flex-col space-y-2">
          <label htmlFor="otp" className="text-sm text-muted-foreground">
            验证码
          </label>
          <InputOTP
            maxLength={6}
            value={verifyCode}
            onChange={(value) => setVerifyCode(value)}
            disabled={loading}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Input
          id="name"
          type="text"
          placeholder="用户名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          required
          autoComplete="username"
        />
        <Input
          id="password"
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
          autoComplete="new-password"
        />
        <Input
          id="confirmPassword"
          type="password"
          placeholder="确认密码"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
          required
          autoComplete="new-password"
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
        disabled={loading || !turnstileToken || !verifyCode}
      >
        {loading ? "注册中..." : "注册"}
      </Button>

      <div className="text-sm text-center">
        <Link href="/auth/login" className="text-primary hover:underline">
          已有账号？立即登录
        </Link>
      </div>
    </form>
  )
}