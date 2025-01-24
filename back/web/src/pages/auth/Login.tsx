import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { authApi } from '@/services/auth'
import { Loader2, Lock, User } from 'lucide-react'
import Turnstile from 'react-turnstile'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// 登录表单验证模式
const loginSchema = z.object({
  email: z.string().email({
    message: '请输入有效的邮箱地址',
  }),
  password: z.string().min(6, {
    message: '密码至少需要6个字符',
  }),
  turnstileToken: z.string({
    required_error: '请完成人机验证',
  }),
})

export default function Login() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'
  const { setTokens, setUser } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      turnstileToken: '',
    },
  })

  // 处理 Turnstile 验证成功
  const handleTurnstileVerified = (token: string) => {
    form.setValue('turnstileToken', token)
  }

  // 处理 Turnstile 验证错误
  const handleTurnstileError = () => {
    toast({
      variant: 'destructive',
      title: '验证失败',
      description: '请重试',
    })
    form.setValue('turnstileToken', '')
  }

  // 处理 Turnstile 验证过期
  const handleTurnstileExpired = () => {
    form.setValue('turnstileToken', '')
  }

  // 处理表单提交
  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      setLoading(true)
      const response = await authApi.login({
        email: data.email,
        password: data.password,
        turnstileToken: data.turnstileToken,
      });
      
      if (!response.data) {
        throw new Error('登录失败：服务器响应数据无效');
      }

      const { accessToken, refreshToken, user } = response.data;
      
      if (!accessToken || !refreshToken || !user) {
        throw new Error('登录失败：令牌或用户信息缺失');
      }

      // 保存令牌和用户信息
      setTokens({
        accessToken,
        refreshToken,
      });
      setUser(user);

      // 检查用户角色
      if (user.role !== 'ADMIN') {
        throw new Error('无权访问后台管理系统')
      }

      toast({
        title: '登录成功',
        description: '欢迎回来！',
      })

      // 登录成功后重定向到原始请求页面
      navigate(from, { replace: true })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '登录失败',
        description: error instanceof Error ? error.message : '未知错误',
      })
      // 重置 turnstile
      form.setValue('turnstileToken', '')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="w-full max-w-[1100px] flex gap-8 items-center px-4 mx-auto min-h-screen">
        {/* 左侧介绍 */}
        <div className="flex-1 hidden lg:block">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            后台管理系统
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            欢迎使用我们的后台管理系统，这里提供了强大的管理功能，帮助您高效管理您的业务。
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-white/50 dark:bg-gray-800/50 rounded-lg shadow-sm backdrop-blur-sm">
              <h3 className="font-semibold mb-2">安全可靠</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                采用最新的安全技术，保护您的数据安全
              </p>
            </div>
            <div className="p-6 bg-white/50 dark:bg-gray-800/50 rounded-lg shadow-sm backdrop-blur-sm">
              <h3 className="font-semibold mb-2">功能强大</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                提供丰富的管理功能，满足各种业务需求
              </p>
            </div>
          </div>
        </div>

        {/* 右侧登录表单 */}
        <div className="w-full max-w-[400px]">
          <Card className="login-card">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">登录</CardTitle>
              <CardDescription className="text-center" />
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>邮箱</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              placeholder="请输入邮箱"
                              className="pl-10"
                              autoComplete="username"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>密码</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              type="password"
                              placeholder=" "
                              className="pl-10"
                              autoComplete="current-password"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="turnstileToken"
                    render={() => (
                      <FormItem>
                        <FormLabel>人机验证</FormLabel>
                        <FormControl>
                          <div className="flex justify-center">
                            <Turnstile
                              id="login-turnstile"
                              sitekey="0x4AAAAAAA5xBJ2fVDTcanOC"
                              onVerify={handleTurnstileVerified}
                              onError={handleTurnstileError}
                              onExpire={handleTurnstileExpired}
                              language="zh-cn"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    登录
                  </Button>
                </form>
              </Form>
              <p className="text-sm text-center text-muted-foreground mt-4">
                忘记密码？请联系管理员重置
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
