import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 左侧图片骨架 */}
      <div className="space-y-4">
        <Skeleton className="aspect-square rounded-lg" />
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-md" />
          ))}
        </div>
      </div>

      {/* 右侧信息骨架 */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-10 w-32" />
          <div className="flex gap-3">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
          </div>
        </div>

        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    </div>
  )
}