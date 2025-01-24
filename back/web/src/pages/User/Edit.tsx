import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useQuery, useMutation } from '@tanstack/react-query'
import { userApi } from '@/services/user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ImageIcon } from 'lucide-react'
import FilePickerDialog from '@/components/common/FilePickerDialog'

const userSchema = z.object({
  name: z.string().min(1, '用户名不能为空'),
  email: z.string().email('请输入有效的邮箱地址'),
  role: z.enum(['USER', 'EDITOR', 'ADMIN', 'GUEST'] as const),
  status: z.enum(['active', 'blocked', 'inactive'] as const),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.password || data.confirmPassword) {
    return data.password === data.confirmPassword
  }
  return true
}, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
})

type UserForm = z.infer<typeof userSchema>

export default function EditUser() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)

  // 获取用户详情
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userApi.getUser(id!),
    enabled: !!id,
  })

  // 更新用户
  const updateUserMutation = useMutation({
    mutationFn: (data: UserForm) =>
      userApi.updateUser(id!, data),
    onSuccess: () => {
      toast({ title: '成功', description: '用户信息更新成功' })
      navigate('/user')
    },
    onError: () => {
      toast({
        title: '错误',
        description: '更新用户信息失败',
        variant: 'destructive',
      })
    },
  })

  const form = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    values: userData?.data
      ? {
          name: userData.data.name,
          email: userData.data.email,
          role: userData.data.role,
          status: userData.data.status,
          avatar: userData.data.avatar || '',
          bio: userData.data.bio || '',
          password: '',
          confirmPassword: '',
        }
      : {
          name: '',
          email: '',
          role: 'USER',
          status: 'active',
          avatar: '',
          bio: '',
          password: '',
          confirmPassword: '',
        },
  })

  function onSubmit(values: UserForm) {
    // 如果密码为空，则不更新密码
    if (!values.password) {
      const { password: _password, confirmPassword: _confirmPassword, ...rest } = values
      updateUserMutation.mutate(rest)
    } else {
      updateUserMutation.mutate(values)
    }
  }

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">编辑用户</h2>
          <p className="text-muted-foreground">
            修改用户信息
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/user')}>
          返回
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>用户信息</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>用户名</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>邮箱</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
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
                      <FormLabel>新密码（留空则不修改）</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>确认新密码</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>角色</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择角色" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USER">普通用户</SelectItem>
                          <SelectItem value="EDITOR">编辑</SelectItem>
                          <SelectItem value="ADMIN">管理员</SelectItem>
                          <SelectItem value="GUEST">访客</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>状态</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择状态" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">正常</SelectItem>
                          <SelectItem value="blocked">已封禁</SelectItem>
                          <SelectItem value="inactive">未激活</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>简介</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>头像</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <div 
                          className="relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-md border"
                          onClick={() => setAvatarDialogOpen(true)}
                        >
                          {field.value ? (
                            <img
                              src={field.value}
                              alt="Avatar"
                              className="h-full w-full rounded-md object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
                              <ImageIcon className="h-8 w-8" />
                              <span>点击选择图片</span>
                            </div>
                          )}
                        </div>
                        {field.value && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => field.onChange('')}
                          >
                            移除
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                    <FilePickerDialog
                      open={avatarDialogOpen}
                      onOpenChange={setAvatarDialogOpen}
                      onSelect={field.onChange}
                      accept="image"
                      title="选择头像"
                    />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/user')}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? '保存中...' : '保存修改'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
