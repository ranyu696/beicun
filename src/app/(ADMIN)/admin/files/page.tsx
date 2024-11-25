import { R2Manager } from "@/components/admin/R2Manager";


export default function FilesPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
    <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">文件管理</h2>
      </div>
      <R2Manager />
    </div>
  )
}