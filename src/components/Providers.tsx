'use client'

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import type { Session } from "next-auth"
import { Toaster } from "./ui/toaster"
import { useState, useEffect } from "react"

interface ProvidersProps {
  children: React.ReactNode
  session: Session | null
}

export function Providers({ children, session }: ProvidersProps) {
      // 使用客户端水合控制
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 避免主题闪烁
  if (!mounted) {
    return (
      <SessionProvider session={session}>
        <div style={{ visibility: 'hidden' }}>{children}</div>
      </SessionProvider>
    )
  }
  return (
    <SessionProvider session={session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light" // 设置默认主题为 light
        enableSystem={false} // 禁用系统主题
        disableTransitionOnChange
        forcedTheme="light" // 强制使用 light 主题
      >
        {children}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  )
}