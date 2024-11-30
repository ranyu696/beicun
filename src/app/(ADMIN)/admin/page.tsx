import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/admin/overview"
import { RecentReviews } from "@/components/admin/recent-reviews"
import { TopProducts } from "@/components/admin/top-products"
import { 
  Users, 
  FileText, 
  Package, 
  MessageSquare,
  TrendingUp,
  Eye
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "仪表盘 - 后台管理",
  description: "数据统计和概览",
}

// 获取统计数据
async function getStats() {
  const [
    totalUsers,
    totalReviews,
    totalProducts,
    totalComments,
    monthlyUsers,
    monthlyReviews,
    monthlyProducts,
    weeklyComments,
  ] = await Promise.all([
    // 总用户数
    prisma.user.count(),
    // 总测评数
    prisma.review.count(),
    // 总产品数
    prisma.product.count(),
    // 总评论数
    prisma.comment.count(),
    // 本月新增用户
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(1)) // 本月1号
        }
      }
    }),
    // 本月新增测评
    prisma.review.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(1))
        }
      }
    }),
    // 本月新增产品
    prisma.product.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(1))
        }
      }
    }),
    // 本周新增评论
    prisma.comment.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    }),
  ])

  return {
    totalUsers,
    totalReviews,
    totalProducts,
    totalComments,
    monthlyUsers,
    monthlyReviews,
    monthlyProducts,
    weeklyComments,
    viewsToday: 1562, // TODO: 实现浏览统计
    conversion: 3.2   // TODO: 实现转化率统计
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">仪表盘</h2>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总用户数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.monthlyUsers} 位新用户（本月）
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">测评数量</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.monthlyReviews} 篇测评（本月）
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">产品数量</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.monthlyProducts} 个产品（本月）
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">评论数量</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComments}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.weeklyComments} 条评论（本周）
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日浏览量</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.viewsToday}</div>
            <p className="text-xs text-muted-foreground">
              +23% 相比昨日
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">转化率</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversion}%</div>
            <p className="text-xs text-muted-foreground">
              +1.2% 相比上月
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>数据概览</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>热门产品</CardTitle>
          </CardHeader>
          <CardContent>
            <TopProducts />
          </CardContent>
        </Card>
      </div>

      {/* 最新测评 */}
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>最新测评</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentReviews />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}