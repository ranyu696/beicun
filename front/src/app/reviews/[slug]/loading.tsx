import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto py-6 max-w-5xl space-y-8">
      {/* 头部区域骨架 */}
      <div className="space-y-6">
        <div className="space-y-4">
          {/* 时间和标签 */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
          {/* 标题 */}
          <Skeleton className="h-8 w-3/4" />
        </div>

        {/* 作者信息 */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>

      {/* 主要内容区域骨架 */}
      <div className="space-y-6">
        {/* 封面图 */}
        <Skeleton className="w-full aspect-video rounded-lg" />

        {/* 文章内容 */}
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              {i % 3 === 0 && <Skeleton className="h-6 w-48" />}
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ))}
        </div>

        {/* 互动区域 */}
        <div className="flex items-center justify-between pt-6">
          <div className="flex gap-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  )
}
