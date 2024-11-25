'use client'

import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { getPageTitle } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar"
import { Button } from "@react-email/components"
import { signOut, useSession } from "next-auth/react"

export function AdminHeader() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  return (
    <header className="h-14 border-b px-6 flex items-center justify-between">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      {/* 面包屑 */}

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">后台管理</BreadcrumbLink>
          </BreadcrumbItem>
          
          {segments.slice(1).map((segment, index) => {
            const path = `/admin/${segments.slice(1, index + 2).join('/')}`
            const isLast = index === segments.length - 2
            const title = getPageTitle(segment)

            return (
              <BreadcrumbItem key={segment}>
                <BreadcrumbSeparator />
                {isLast ? (
                  <BreadcrumbLink href={path}>{title}</BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {/* 用户头像 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button  className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session?.user?.image || ''} alt="用户头像" />
              <AvatarFallback>
                {session?.user?.name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => signOut()}>
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}