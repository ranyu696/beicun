import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 标题骨架 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 筛选器骨架 */}
          <div className="w-full lg:w-64 shrink-0">
            <Skeleton className="h-[600px]" />
          </div>

          {/* 产品列表骨架 */}
          <div className="flex-1 space-y-6">
            <Skeleton className="h-10 w-[180px]" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 