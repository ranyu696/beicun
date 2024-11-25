import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"
import { sendPasswordResetEmail } from "@/lib/email"

const schema = z.object({
  email: z.string().email("邮箱格式不正确"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = await schema.parseAsync(body)

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "该邮箱未注册" },
        { status: 400 }
      )
    }

    // 生成重置token
    const resetToken = crypto.randomUUID()
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期

    // 更新用户的重置token
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // 发送重置密码邮件
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
    await sendPasswordResetEmail(email, resetUrl)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("忘记密码错误:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "发送重置邮件失败，请稍后重试" },
      { status: 500 }
    )
  }
}