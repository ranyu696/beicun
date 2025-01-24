import { Button } from "@/components/ui/button"
import { PackageSearch } from "lucide-react"
import Link from "next/link"

export default function ProductsNotFound() {
  return (
    <div className="container mx-auto py-32 px-4">
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        <div className="rounded-full bg-muted p-6">
          <PackageSearch className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-3xl font-bold">未找到产品</h2>
        <p className="text-muted-foreground max-w-md">
          抱歉，我们找不到您要查找的产品。请尝试使用其他搜索条件，或浏览我们的全部产品。
        </p>
        <Button asChild>
          <Link href="/products">
            查看全部产品
          </Link>
        </Button>
      </div>
    </div>
  )
}