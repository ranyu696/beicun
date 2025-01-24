import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Settings() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">系统设置</h1>
      <Card>
        <CardHeader>
          <CardTitle>基本设置</CardTitle>
        </CardHeader>
        <CardContent>
          <p>系统设置页面</p>
        </CardContent>
      </Card>
    </div>
  )
}
