import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { NextResponse } from "next/server"
import { z } from "zod"
import { sendVerificationEmail } from "@/lib/email"

const registerSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(6, "密码至少6位").max(32, "密码最多32位"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = await registerSchema.parseAsync(body)

    // 检查邮箱是否已注册
    const exists = await prisma.user.findUnique({
      where: { email }
    })

    if (exists) {
      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 400 }
      )
    }

    // 生成验证token
    const verificationToken = crypto.randomUUID()
    
    // 创建用户
    const hashedPassword = await hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        verificationToken
      }
    })

    // 发送验证邮件
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`
    await sendVerificationEmail(email, verificationUrl)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      }
    })
  } catch (error) {
    console.error("注册错误:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "注册失败，请稍后重试" },
      { status: 500 }
    )
  }
}