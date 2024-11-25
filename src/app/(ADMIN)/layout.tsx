import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/Header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UserRole } from "@prisma/client"

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  // 获取当前会话
  const session = await auth()

  // 如果未登录，重定向到登录页
  if (!session) {
    redirect("/login?callbackUrl=/admin")
  }

  // 如果不是管理员，重定向到首页
  if (session.user.role !== UserRole.ADMIN) {
    redirect("/")
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}