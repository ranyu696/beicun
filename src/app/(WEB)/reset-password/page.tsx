
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

type SearchParams = Promise<{ token: string }>
export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: SearchParams
}) {
  const { token } = await searchParams

  if (!token) {
    redirect("/login")
  }

  // 验证token是否有效
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gt: new Date()
      }
    }
  })

  if (!user) {
    return <div>重置链接无效或已过期</div>
  }

  return (
    <div className="max-w-sm mx-auto p-6">
      <ResetPasswordForm token={token} />
    </div>
  )
}