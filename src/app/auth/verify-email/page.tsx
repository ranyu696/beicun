import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"
import React from "react"

type Params = Promise<{ token: string }>

export default async function VerifyEmailPage({
  searchParams
}: {
  searchParams: Params
}) {
  const { token } = await searchParams

  if (!token) {
    redirect("/login")
  }

  try {
    // 验证token并更新用户
    const user = await prisma.user.update({
      where: {
        verificationToken: token,
      },
      data: {
        emailVerified: true,
        verificationToken: null,
      },
    })

    if (!user) {
      return <div>验证链接无效或已过期</div>
    }

    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">邮箱验证成功</h1>
        <p className="mt-2">您现在可以登录了</p>
        <Link href="/login" className="text-blue-500 hover:text-blue-700">
          前往登录
        </Link>
      </div>
    )
  } catch (error) {
    if (error instanceof Error) {
      return <div>验证失败，请重试 {error.message}</div>
    }
    return <div>验证失败，请重试</div>
  }
}