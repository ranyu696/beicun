import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { userApi } from '@/services/user'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import type { UserReview, UserLoginHistory } from '@/types/user'

export default function UserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  // 获取用户详情
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userApi.getUser(id!),
    enabled: !!id,
  })

  // 获取用户评论
  const { data: reviewsData } = useQuery({
    queryKey: ['user-reviews', id],
    queryFn: () => userApi.getUserReviews(id!),
    enabled: !!id,
  })

  // 获取用户登录历史
  const { data: loginHistoryData } = useQuery({
    queryKey: ['user-login-history', id],
    queryFn: () => userApi.getUserLoginHistory(id!),
    enabled: !!id,
  })

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const user = userData?.data

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>用户不存在</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">用户详情</h2>
          <p className="text-muted-foreground">
            查看用户的详细信息、评论和登录历史
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/user')}>
          返回
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>
                  {user.name[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-4 flex-1">
                <div className="space-y-1">
                  <h3 className="text-2xl font-medium">{user.name}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{user.role === 'ADMIN' ? '管理员' : '普通用户'}</Badge>
                    <Badge
                      variant={user.status === 'active' ? 'default' : 'secondary'}
                    >
                      {user.status === 'active' ? '正常' : '已禁用'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      邮箱
                    </div>
                    <div className="text-sm">{user.email}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      简介
                    </div>
                    <div className="text-sm">{user.bio || '暂无简介'}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      注册时间
                    </div>
                    <div className="text-sm">
                      {format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      最后登录
                    </div>
                    <div className="text-sm">
                      {user.lastLoginAt
                        ? format(new Date(user.lastLoginAt), 'yyyy-MM-dd HH:mm:ss')
                        : '从未登录'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="reviews">
          <TabsList>
            <TabsTrigger value="reviews">评论记录</TabsTrigger>
            <TabsTrigger value="login-history">登录历史</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>评论记录</CardTitle>
                <CardDescription>用户发表的所有评论</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>内容</TableHead>
                      <TableHead>评分</TableHead>
                      <TableHead>时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviewsData?.data?.map((review: UserReview) => (
                      <TableRow key={review.id}>
                        <TableCell>{review.content}</TableCell>
                        <TableCell>{review.rating}</TableCell>
                        <TableCell>
                          {format(new Date(review.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="login-history">
            <Card>
              <CardHeader>
                <CardTitle>登录历史</CardTitle>
                <CardDescription>用户的登录记录</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>登录时间</TableHead>
                      <TableHead>IP地址</TableHead>
                      <TableHead>设备信息</TableHead>
                      <TableHead>地理位置</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loginHistoryData?.data?.map((record: UserLoginHistory) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {format(new Date(record.loginTime), 'yyyy-MM-dd HH:mm:ss')}
                        </TableCell>
                        <TableCell>{record.ipAddress}</TableCell>
                        <TableCell>{record.userAgent}</TableCell>
                        <TableCell>{record.location || '未知'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
