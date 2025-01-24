import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 头部区域骨架 */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>

      {/* 测评列表骨架 */}
      <div className="grid gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-6 p-6 rounded-lg border">
            {/* 左侧图片骨架 */}
            <Skeleton className="w-48 h-32 rounded-lg shrink-0" />
            
            {/* 右侧内容骨架 */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-3/4" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}