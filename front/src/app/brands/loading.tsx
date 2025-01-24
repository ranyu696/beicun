import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Skeleton className="h-10 w-32" /> {/* 标题 */}
          <Skeleton className="h-6 w-64" /> {/* 描述文本 */}
          <Skeleton className="h-9 w-24" /> {/* Badge */}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    </div>
    </div>
  )
} 