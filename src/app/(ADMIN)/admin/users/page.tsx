import { Metadata } from "next"
import { UserList } from "@/components/admin/users/UserList"

export const metadata: Metadata = {
  title: "用户管理 - 后台管理",
  description: "管理系统用户",
}

export default function UsersPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">用户管理</h2>
      </div>

      <UserList />
    </div>
  )
}