import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PackageSearch } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <PackageSearch className="h-5 w-5 text-muted-foreground" />
          <CardTitle>未找到产品</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          抱歉，您要查看的产品不存在或已下架。
        </p>
        <Button asChild>
          <Link href="/products">
            返回产品列表
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}