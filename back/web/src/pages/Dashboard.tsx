import { useQuery } from '@tanstack/react-query'
import {
  ChevronDown,
  ChevronUp,
  Star,
  Tag,
  User,
  Users,
} from 'lucide-react'

import { statsApi } from '@/services/stats'
import StatsCard from '@/components/dashboard/StatsCard'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { formatNumber } from '@/lib/format'

export default function Dashboard() {
  // 获取统计数据
  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: statsApi.getDashboardStats,
  })

  // 确保数据存在
  if (!statsData?.data) {
    return <div>Loading...</div>
  }

  const stats = statsData.data

  // 计算趋势
  const calculateTrend = (current: number, previous: number) => {
    const diff = current - previous
    const percentage = (diff / previous) * 100
    return {
      value: Math.abs(percentage),
      type: percentage >= 0 ? 'increase' as const : 'decrease' as const,
      label: '较上月',
    }
  }

  return (
    <div className="space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">仪表盘</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="总产品数"
          value={formatNumber(stats.totalProducts)}
          icon={Tag}
          trend={calculateTrend(stats.totalProducts, stats.totalProducts - 10)} // 示例趋势数据
        />
        <StatsCard
          title="总用户数"
          value={formatNumber(stats.totalUsers)}
          icon={Users}
          trend={calculateTrend(stats.totalUsers, stats.totalUsers - 5)} // 示例趋势数据
        />
        <StatsCard
          title="总测评数"
          value={formatNumber(stats.totalReviews)}
          icon={Star}
          trend={calculateTrend(stats.totalReviews, stats.totalReviews - 15)} // 示例趋势数据
        />
        <StatsCard
          title="待审核"
          value={formatNumber(stats.pendingReviews)}
          icon={User}
          trend={calculateTrend(stats.pendingReviews, stats.pendingReviews - 2)} // 示例趋势数据
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">品牌分布</h3>
            </div>
            <div className="mt-4 space-y-2">
              {stats.productsByBrand.map((brand) => (
                <div key={brand.brandName} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{brand.brandName}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {formatNumber(brand.count)}
                    </span>
                    <ChevronUp className="h-4 w-4 text-emerald-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card className="col-span-3">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">最新测评</h3>
            </div>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {stats.topReviews.map((review) => (
                  <div key={review.id}>
                    <div className="flex items-center">
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {review.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {review.author} · {review.viewCount} 次浏览
                        </p>
                      </div>
                      {review.viewCount > 100 ? (
                        <ChevronUp className="ml-auto h-4 w-4 text-emerald-500" />
                      ) : (
                        <ChevronDown className="ml-auto h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <Separator className="my-2" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </Card>
      </div>
    </div>
  )
}
