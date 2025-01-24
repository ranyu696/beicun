import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'

export default function Unauthorized() {
  const navigate = useNavigate()
  const { clearAuth } = useAuthStore()

  // 处理返回登录
  const handleBackToLogin = () => {
    clearAuth()
    navigate('/auth/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <CardTitle className="text-2xl font-bold">访问被拒绝</CardTitle>
          </div>
          <CardDescription>
            您没有访问此页面的权限。请联系管理员获取适当的访问权限。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            可能的原因：
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>您的账号没有足够的权限</li>
              <li>您需要管理员或编辑者权限</li>
              <li>您的账号可能需要升级</li>
            </ul>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
            >
              返回上一页
            </Button>
            <Button
              variant="destructive"
              onClick={handleBackToLogin}
            >
              重新登录
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
