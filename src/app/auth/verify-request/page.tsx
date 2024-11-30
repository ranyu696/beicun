import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"


type SearchParams = Promise<{ [key: string]: string | undefined }>

export default async function VerifyEmailPage({
  searchParams
}: {
  searchParams: SearchParams
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
        emailVerified: true, // 改为布尔值 true
        verificationToken: null,
      },
    })

    if (!user) {
      return (
        <div className="container mx-auto max-w-md py-20 text-center">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-red-600">验证失败</h1>
            <p className="mt-2 text-gray-600">验证链接无效或已过期</p>
            <Link href="/login" className="mt-4 text-blue-500 hover:text-blue-700 block">
              返回登录
            </Link>
          </div>
        </div>
      )
    }

    return (
      <div className="container mx-auto max-w-md py-20 text-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-green-600">邮箱验证成功</h1>
          <p className="mt-2 text-gray-600">您的邮箱已验证，现在可以登录了</p>
          <Link
            href="/login"
            className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            前往登录
          </Link>
        </div>
      </div>
    )
  } catch (error) {
    console.error("验证邮箱错误:", error)
    return (
      <div className="container mx-auto max-w-md py-20 text-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600">验证失败</h1>
          <p className="mt-2 text-gray-600">
            {error instanceof Error ? error.message : "验证过程中发生错误"}
          </p>
          <Link href="/login" className="mt-4 text-blue-500 hover:text-blue-700 block">
            返回登录
          </Link>
        </div>
      </div>
    )
  }
} 