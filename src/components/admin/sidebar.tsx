'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sidebar, SidebarFooter } from "@/components/ui/sidebar"
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Users, 
  Settings,
  MessageSquare,
  Tags,
  Building2,
  ChevronDown,
  List
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const sidebarItems = [
  {
    title: '控制台',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    title: '产品管理',
    href: '/admin/products',
    icon: Package
  },
  {
    title: '品牌管理',
    href: '/admin/brands',
    icon: Building2
  },
  {
    title: '分类管理',
    icon: List,
    submenu: [
      { title: '产品类型', href: '/admin/categories/product-types' },
      { title: '通道类型', href: '/admin/categories/channel-types' },
      { title: '材料类型', href: '/admin/categories/material-types' }
    ]
  },
  {
    title: '标签管理',
    href: '/admin/tags',
    icon: Tags
  },
  {
    title: '测评管理',
    href: '/admin/reviews',
    icon: FileText
  },
  {
    title: '评论管理',
    href: '/admin/comments',
    icon: MessageSquare
  },
  {
    title: '用户管理',
    href: '/admin/users',
    icon: Users
  },
  {
    title: '系统设置',
    href: '/admin/settings',
    icon: Settings
  }
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<string[]>([])

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const isSubmenuActive = (submenu: typeof sidebarItems[0]['submenu']) => {
    if (!submenu) return false
    return submenu.some(item => pathname === item.href)
  }

  return (
    <Sidebar>
      <div className="flex h-14 items-center border-b px-6">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <Package className="h-6 w-6" />
          <span>杯村后台</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2 py-4">
          {sidebarItems.map((item) => {
            // 判断是否为子菜单项
            if (item.submenu) {
              const isOpen = openMenus.includes(item.title)
              const isActive = isSubmenuActive(item.submenu)
              
              return (
                <Collapsible
                  key={item.title}
                  open={isOpen}
                  onOpenChange={() => toggleMenu(item.title)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-between",
                        isActive && "bg-secondary"
                      )}
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.title}
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isOpen && "rotate-180"
                        )}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 px-4 py-2">
                    {item.submenu.map((subitem) => (
                      <Button
                        key={subitem.href}
                        variant={pathname === subitem.href ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start",
                          pathname === subitem.href && "bg-secondary"
                        )}
                        asChild
                      >
                        <Link href={subitem.href}>
                          {subitem.title}
                        </Link>
                      </Button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )
            }

            // 普通菜单项
            return (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  pathname === item.href && "bg-secondary"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            )
          })}
        </div>
      </ScrollArea>
      <SidebarFooter>
        <div className="flex items-center justify-center p-4 text-sm">
          © 2024 杯村
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}