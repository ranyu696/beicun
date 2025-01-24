import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Company() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">企业管理</h1>
      <Card>
        <CardHeader>
          <CardTitle>企业列表</CardTitle>
        </CardHeader>
        <CardContent>
          <p>企业管理页面</p>
        </CardContent>
      </Card>
    </div>
  )
}
