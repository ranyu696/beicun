'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Menu, Search, X } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import React from 'react'
import { UserMenu } from "@/components/user/UserMenu"
import { signOut, useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Settings,LogOut, ShieldCheck } from "lucide-react"
import { UserRole } from "@prisma/client"

const tutorials = [
  {
    title: "新手指南",
    href: "/tutorials/beginner",
    description: "适合新手的入门教程，包含基础知识和使用技巧。"
  },
  {
    title: "进阶教程",
    href: "/tutorials/advanced",
    description: "深入了解进阶技巧和专业知识。"
  },
  {
    title: "清洁保养",
    href: "/tutorials/maintenance",
    description: "学习正确的清洁方法和日常保养技巧。"
  },
  {
    title: "常见问题",
    href: "/tutorials/faq",
    description: "解答用户最常遇到的问题和疑惑。"
  }
]

export function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16">
        {/* 桌面导航 */}
        <div className="hidden md:flex items-center justify-between h-full">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-gray-800">
              杯村
            </Link>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      首页
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link href="/products" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      产品
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link href="/reviews" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      测评
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>教程</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      {tutorials.map((tutorial) => (
                        <ListItem
                          key={tutorial.href}
                          title={tutorial.title}
                          href={tutorial.href}
                        >
                          {tutorial.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center space-x-4">
            <Input type="search" placeholder="搜索名器..." className="w-64" />
            {session ? (
              <UserMenu />
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link href="/login">登录</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">注册</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* 移动端导航 */}
        <div className="md:hidden flex items-center justify-between h-full">
          <Link href="/" className="text-xl font-bold text-gray-800">
            杯村
          </Link>

          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4">
                  <Link 
                    href="/" 
                    className="px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-md"
                  >
                    首页
                  </Link>
                  <Link 
                    href="/products" 
                    className="px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-md"
                  >
                    产品
                  </Link>
                  <Link 
                    href="/reviews" 
                    className="px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-md"
                  >
                    测评
                  </Link>
                  
                  {/* 教程菜单 */}
                  <div className="space-y-2">
                    <div className="px-4 py-2 text-sm font-medium text-gray-900">
                      教程
                    </div>
                    {tutorials.map((tutorial) => (
                      <Link
                        key={tutorial.href}
                        href={tutorial.href}
                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md ml-4"
                      >
                        {tutorial.title}
                      </Link>
                    ))}
                  </div>

                  <div className="pt-4">
                    {session ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4 px-4">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={session.user.image || ''} />
                            <AvatarFallback>
                              {session.user.name?.[0] || session.user.email?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{session.user.name || '用户'}</p>
                            <p className="text-xs text-muted-foreground">{session.user.email}</p>
                          </div>
                        </div>
                        
                        <Link 
                          href="/profile" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <User className="mr-2 h-4 w-4" />
                          个人资料
                        </Link>
                        
                        
                        <Link 
                          href="/profile/settings" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          设置
                        </Link>

                        {session.user.role === UserRole.ADMIN && (
                          <Link 
                            href="/admin" 
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            管理后台
                          </Link>
                        )}

                        <Button 
                          variant="destructive" 
                          className="w-full"
                          onClick={() => signOut({ callbackUrl: '/' })}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          退出登录
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button asChild variant="outline" className="w-full">
                          <Link href="/login">登录</Link>
                        </Button>
                        <Button asChild className="w-full mt-2">
                          <Link href="/register">注册</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* 移动端搜索栏 */}
        {isSearchOpen && (
          <div className="md:hidden absolute left-0 right-0 top-16 p-4 bg-white shadow-lg border-t">
            <Input 
              type="search" 
              placeholder="搜索名器..." 
              className="w-full"
              autoFocus
            />
          </div>
        )}
      </div>
    </header>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"